import { App } from "vue";
import axios, {AxiosInstance} from "axios";
import VueAxios from "vue-axios";
import JwtService from "@/core/services/JwtService";
import { AxiosResponse, AxiosRequestConfig } from "axios";

/**
 * @description service to call HTTP request via Axios
 */
class ApiService {
  /**
   * @description property to share vue instance
   */
  public static vueInstance: App;
  public static initialized = false;

  /**
   * @description initialize vue axios
   */
  public static init(app: App<Element>) {
    ApiService.vueInstance = app;
    ApiService.vueInstance.use(VueAxios, axios);
    ApiService.vueInstance.axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL;
    ApiService.initialized = true;
  }

  /**
   * @description set the default HTTP request headers
   */
  public static setHeader(instance: AxiosInstance | null = null): void {
    if (instance === null) {
      instance = ApiService.vueInstance.axios
    }
    instance.defaults.headers.common[
        "Authorization"
        ] = `Token ${JwtService.getToken()}`;
    instance.defaults.headers.common["Accept"] =
        "application/json";
  }

  /**
   * @description send the GET HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static query(
    resource: string,
    params: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.get(resource, params);
  }

  /**
   * @description send the GET HTTP request
   * @param resource: string
   * @param slug: string
   * @returns Promise<AxiosResponse>
   */
  public static get(
    resource: string,
    slug = "" as string
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.get(`${resource}/${slug}`);
  }


  /**
   * @description send the GET HTTP request
   * @param resource: string
   * @param slug: string
   * @returns Promise<AxiosResponse>
   */
  public static get2(
      resource: string
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.get(`${resource}`);
  }


  /**
   * @description set the POST HTTP request
   * @param resource: string
   * @param data: any
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static post<D = any>(
    resource: string,
    params?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.post(`${resource}`, params);
  }

  public static postFile<D = any>(
      resource: string,
      file: FormData
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.post(`${resource}`, file);
  }

  /**
   * @description send the UPDATE HTTP request
   * @param resource: string
   * @param slug: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static update(
    resource: string,
    slug: string,
    params: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.put(`${resource}/${slug}`, params);
  }

  /**
   * @description Send the PUT HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static put(
    resource: string,
    params: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.put(`${resource}`, params);
  }

  /**
   * @description Send the DELETE HTTP request
   * @param resource: string
   * @returns Promise<AxiosResponse>
   */
  public static delete(resource: string): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.delete(resource);
  }
}

export default ApiService;
