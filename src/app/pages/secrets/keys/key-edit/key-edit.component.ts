import { Component } from '@angular/core';
import {NzInputNumberComponent} from "ng-zorro-antd/input-number";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute, Router} from "@angular/router";
import {KeyCallService} from "../../../../services";
import {KeyTypes, Model, ModelKeyBind} from "../../../../models/keys";
import {admin_routes} from "../../../../routes";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";

@Component({
  selector: 'app-key-edit',
  standalone: true,
  imports: [
    NzInputNumberComponent,
    NzTooltipDirective,
    ReactiveFormsModule,
    FormsModule,
    NzOptionComponent,
    NzSelectComponent
  ],
  templateUrl: './key-edit.component.html',
  styleUrl: './key-edit.component.css'
})
export class KeyEditComponent {
  constructor(
    private fb: NonNullableFormBuilder,
    private message: NzMessageService,
    private call: KeyCallService,
    private router: Router,
    private route: ActivatedRoute) {
    const keyId = parseInt(this.route.snapshot.params['keyId']);
    this.call.getKeyById(keyId)
      .subscribe({
        next: key=>{
          this.validateForm.setValue({
            supplierKeyId: key.supplierKeyId!,
            baseUrl: key.baseUrl!,
            apiKey:key.apiKey!,
            requestIdentifier: key.requestIdentifier!,
            enable: key.enable!
          });
          this.modelKeyBinds.length = 0;
          if(key.modelKeyBinds===undefined){
            return;
          }
          for(let modelKeyBind of key.modelKeyBinds){
            this.modelKeyBinds.push(modelKeyBind);
          }
        }
      })
  }
  goBack() {
    this.router.navigate([this.returnUrl]);
  }
  returnUrl: string | undefined;
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
  types:KeyTypes[] | undefined;
  actionTip(modelId: number){
    return this.modelKeyBinds.find(r=>r.modelId===modelId)!==undefined?'移除':'添加';
  }
  active(modelId: number){
    return this.modelKeyBinds.find(r=>r.modelId===modelId)!==undefined;
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
  submitForm() {
    if (this.validateForm.valid) {
      const value = this.validateForm.value;
      console.log(value)
      this.call.updateKey(
        {
          supplierKeyId: value.supplierKeyId!,
          baseUrl: value.baseUrl!,
          apiKey: value.apiKey!,
          requestIdentifier: value.requestIdentifier!,
          modelKeyBinds: this.modelKeyBinds,
          enable: value!.enable
        })
        .subscribe({
          next: () =>{
            this.message.success('更改密钥成功');
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
        fee: 1,
        enable: true,
      };
      this.modelKeyBinds.push(modelKeyBind);
    }
  }
}
