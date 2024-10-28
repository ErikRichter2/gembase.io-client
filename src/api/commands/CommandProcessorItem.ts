import {Command, CommandState} from "@/api/commands/Command";
import CommandProcessor from "@/api/commands/CommandProcessor";
import ClientError from "@/core/errors/ClientError";

export default class CommandProcessorItem {
    private readonly _commandProcessor: CommandProcessor;
    private readonly _initial: Command;
    private readonly _undoFactory: ((data) => Command) | null;
    private readonly _redoFactory: ((data) => Command) | null;
    private _state = CommandState.Initial;

    private _undo: Command | null = null;
    private _redo: Command | null = null;

    constructor(
        commandProcessor: CommandProcessor,
        initial: Command,
        undoFactory: ((data) => Command) | null,
        redoFactory: ((data) => Command) | null) {
        this._commandProcessor = commandProcessor;
        this._initial = initial;
        this._initial.setOptions(commandProcessor.options);
        this._undoFactory = undoFactory;
        this._redoFactory = redoFactory;
    }

    createUndoRedoCommands(response) {
        if (this.state !== CommandState.Initial) {
            throw new ClientError("State not in initial");
        }

        if (this._undoFactory === null) {
            throw new ClientError("Undo factory not defined");
        }

        this._undo = this._undoFactory(response);
        this._undo.setOptions(this._commandProcessor.options);

        if (this._redoFactory === null) {
            this._redo = this._initial;
        } else {
            this._redo = this._redoFactory(response);
            this._redo.setOptions(this._commandProcessor.options);
        }
    }

    get command(): Command {
        switch (this.state) {
            case CommandState.Undo:
                if (this._undo === null) {
                    throw new ClientError("Undo not created");
                }
                return this._undo;
            case CommandState.Redo:
                if (this._redo === null) {
                    throw new ClientError("Redo not created");
                }
                return this._redo;
            case CommandState.Initial:
                return this._initial;
        }
    }

    get state(): CommandState {
        return this._state;
    }

    set state(value: CommandState) {
        this._state = value;
    }

    get hasUndo(): boolean {
        return this._undoFactory !== null;
    }
}
