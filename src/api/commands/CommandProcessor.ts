import {
    Command,
    CommandResponse,
    CommandState,
    HandlersCommandOptions,
    Options, OptionsItem
} from "@/api/commands/Command";
import CommandProcessorItem from "@/api/commands/CommandProcessorItem";
import ClientError from "@/core/errors/ClientError";

export default class CommandProcessor {
    private _queue: CommandProcessorItem[] = [];
    private _undoQueue: CommandProcessorItem[] = [];
    private _redoQueue: CommandProcessorItem[] = [];
    private _active: CommandProcessorItem | null = null;
    private readonly _options: Options = new Options();

    process(
        command: Command,
        undoFactory: ((data) => Command) | null = null,
        redoFactory: ((data) => Command) | null = null)  {
        this.addToProcessQueue(new CommandProcessorItem(this, command, undoFactory, redoFactory));
    }

    hasUndo(): boolean {
        return this._undoQueue.length > 0;
    }

    undo() {
        if (!this.hasUndo() || this._active !== null) {
            return;
        }

        this.addToProcessQueue(this._undoQueue[this._undoQueue.length - 1], CommandState.Undo);
    }

    hasRedo(): boolean {
        return this._redoQueue.length > 0;
    }

    redo() {
        if (!this.hasRedo() || this._active !== null) {
            return;
        }

        this.addToProcessQueue(this._redoQueue[this._redoQueue.length - 1], CommandState.Redo);
    }

    private addToProcessQueue(commandProcessorItem: CommandProcessorItem, state: CommandState = CommandState.Initial) {
        commandProcessorItem.state = state;
        this._queue.push(commandProcessorItem);
        this.processQueueInternal()
    }

    private processQueueInternal() {
        if (this._queue.length === 0 || this._active !== null) {
            return;
        }

        const commandProcessorItem = this._queue.shift();

        if (commandProcessorItem === undefined) {
            throw new ClientError("Undefined command in queue");
        }

        this._active = commandProcessorItem;

        const o = this._options.get(HandlersCommandOptions);
        if (o !== null && o.progressHandler !== null)
            o.progressHandler(true);

        this._active.command.execute()
            .then(this.onCommandProcessorItemResponse)
            .catch(this.onCommandProcessorItemResponse);
    }

    private onCommandProcessorItemResponse(response: CommandResponse) {
        const o = this._options.get(HandlersCommandOptions);
        if (o !== null && o.progressHandler !== null)
            o.progressHandler(false);

        const commandProcessorItem = this._active as CommandProcessorItem;
        this._active = null;

        switch (commandProcessorItem.state) {
            case CommandState.Initial:
                this._redoQueue.length = 0;
                if (commandProcessorItem.hasUndo) {
                    commandProcessorItem.createUndoRedoCommands(response);
                    this._undoQueue.push(commandProcessorItem);
                }
                commandProcessorItem.command.dispatch(response);
                if (o !== null && o.responseHandler !== null) {
                    o.responseHandler(response);
                }
                break;
            case CommandState.Undo:
                this._undoQueue.pop();
                this._redoQueue.push(commandProcessorItem);
                commandProcessorItem.command.dispatch(response);
                if (o !== null && o.responseHandler !== null) {
                    o.responseHandler(response);
                }
                break;
            case CommandState.Redo:
                this._redoQueue.pop();
                this._undoQueue.push(commandProcessorItem);
                commandProcessorItem.command.dispatch(response);
                if (o !== null && o.responseHandler !== null) {
                    o.responseHandler(response);
                }
                break;
        }
    }

    addOptions<T extends OptionsItem>(optionsItem: T): CommandProcessor {
        this._options.add(optionsItem);
        return this;
    }

    get options(): Options {
        return this._options;
    }
}
