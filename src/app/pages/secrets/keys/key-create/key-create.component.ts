import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute, Router} from "@angular/router";
import {NzInputNumberComponent} from "ng-zorro-antd/input-number";
import {NzSkeletonComponent} from "ng-zorro-antd/skeleton";
import {KeyCallService} from "../../../../services";
import {KeyTypes, Model, ModelKeyBind} from "../../../../models/keys";
import {admin_routes} from "../../../../routes";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";

@Component({
  selector: 'app-key-create',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzTooltipDirective,
    NzInputNumberComponent,
    NzSkeletonComponent,
    NzSelectComponent,
    NzOptionComponent
  ],
  templateUrl: './key-create.component.html',
  styleUrl: './key-create.component.css'
})
export class KeyCreateComponent {
  constructor(
    private fb: NonNullableFormBuilder,
    private message: NzMessageService,
    private call: KeyCallService,
    private router: Router,
    private route: ActivatedRoute) {
  }
  goBack() {
    this.router.navigate([this.returnUrl]);
  }
  returnUrl: string | undefined;
  types:KeyTypes[] | undefined;
  ngOnInit(){
    this.fetchTypes();
    this.fetchModels();
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'];
    });
  }
  validateForm: FormGroup<{
    supplierKeyId: FormControl<number>,
    baseUrl: FormControl<string>,
    apiKey: FormControl<string>,
    requestIdentifier: FormControl<number>,
    enable: FormControl<boolean>
  }> = this.fb.group({
    supplierKeyId: [0, [Validators.required]],
    baseUrl: ['', [Validators.required]],
    apiKey: ['', [Validators.required]],
    requestIdentifier: [0,[Validators.required]],
    enable: [true]
  });
  modelKeyBinds: ModelKeyBind[] = [];
  allModels: Model[] | undefined;
  actionTip(modelId: number){
    return this.modelKeyBinds.find(r=>r.modelId===modelId)!==undefined?'移除':'添加';
  }
  active(modelId: number){
    return this.modelKeyBinds.find(r=>r.modelId===modelId)!==undefined;
  }
  fetchTypes(){
    this.call.getKeyTypes().subscribe({
      next: types=>{
        this.types = types;
      },
      error: err => {
        this.message.error("加载密钥类型失败")
      }
    })
  }
  fetchModels(refresh: boolean = false){
    this.call.getModelsWithKey().subscribe({
      next: models=>{
        this.allModels = models;
        if(refresh){
          this.message.success("刷新成功");
        }
      },
      error:() => {
        this.message.error("获取模型信息失败")
      }
    })
  }
  submitForm() {
    if (this.validateForm.valid) {
      const value = this.validateForm.value;
      this.call.addKey(
        {
          supplierKeyId: value.supplierKeyId!,
          baseUrl: value.baseUrl!,
          apiKey: value.apiKey!,
          requestIdentifier: value.requestIdentifier!,
          modelKeyBinds: this.modelKeyBinds,
          enable: value.enable!
        })
        .subscribe({
          next: () =>{
            this.message.success('创建密钥成功');
            this.router.navigate(admin_routes.keys);
          },
          error: (err: any) => {
            this.message.error(err.error);
          }
        })
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  action(model: Model) {
    if(this.active(model.modelId!)){
      this.modelKeyBinds = this.modelKeyBinds.filter(r=>r.modelId!==model.modelId);
    }else{
      const modelKeyBind: ModelKeyBind = {
        modelId : model.modelId,
        model: model,
        enable: true,
        fee: 1
      };
      this.modelKeyBinds.push(modelKeyBind);
    }
  }
}
