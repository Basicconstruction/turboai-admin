import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {ServiceProvider} from "../roots";

@Injectable(
  {
    providedIn: "root"
  }
)
export class AuthCallService {
  constructor(private http: HttpClient,private provider: ServiceProvider
  ) {

  }

  login(body: any) {
    return this.http.post<any>(`${this.provider.apiUrl}api/auth/login`, body);
  }

  register(body: any) {
    return this.http.post(`${this.provider.apiUrl}api/auth/register`,body);
  }
  check_token(){
    return this.http.get<any>(`${this.provider.apiUrl}api/verification/check-token`);
  }
  generateVerificationCode(){
    return this.http.get(`${this.provider.apiUrl}api/verification/generate`);
  }
}
