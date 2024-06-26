import {Injectable} from "@angular/core";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {admin_routes} from "../routes";
import {AuthService} from "../auth_module";


@Injectable({
  providedIn: "root"
})
export class AdminAuthGuard {
  constructor(private message: NzMessageService,
              private authService: AuthService,
              private router: Router) {

  }
  canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot):Promise<boolean>|boolean{
    if(this.authService.isLogin){
      return true;
    }else{
      this.message.error("还没有登录哦");
      this.router.navigate(admin_routes.sign_in);
      return false;
    }
  }
}
