

class Vue{
    constructor(options){
        this.$options = options;
        this._data = options.data;
        this.observe(this._data);
        this.compile();
    }
    //通过使用ES6中的Proxy来观察数据
    observe(data){
        let temp = {};
        this._data = new Proxy(data,{
            get(target,key){
                temp[key] = new Dep();
                if(Dep.target){
                    temp[key].add(Dep.target);
                }
                return Reflect.get(target,key)
            },
            set(target,key,newValue){
                temp[key].notify(newValue);
                return Reflect.set(target,key,newValue);
            }
        })
    }
    //通过使用ES5中的defineProperty
    // observe(data){
    //     let keys = Object.keys(data);
    //     keys.forEach(key=>{
    //         let dep = new Dep();
    //         let value = data[key]
    //         Object.defineProperty(data,key,{
    //             configurable:true,
    //             enumerable:true,
    //             get(){
    //                 console.log('get');
    //                 if(Dep.target){
    //                     dep.add(Dep.target);
    //                 }
    //                 return value;
    //             },
    //             set(newValue){
    //                 console.log('set',dep);
    //                 dep.notify(newValue);
    //                 //触发事件
    //             }
    //         })
    //     })
        
    // }
    compile(){
        let ele = document.querySelector(this.$options.el);
        this.compileNodes(ele);
    }
    compileNodes(ele){
        let nodes = ele.childNodes;
        nodes.forEach(node=>{
            if(node.nodeType === 1){
                //元素节点
                //对v-model进行处理，实现双向绑定
                let attrs = node.attributes;
                console.log(attrs);
                [...attrs].forEach(attr=>{
                    let attrName = attr.name;
                    let attrValue = attr.value;
                    if(attrName === 'v-model'){
                        node.value = this._data[attrValue];
                        node.addEventListener('input',e=>{
                            let newValue = e.target.value;
                            //通过对this.data[attrValue]触发响应式
                            this._data[attrValue] = newValue;
                        })
                        //处理v-html和v-text
                    }else if(attrName === 'v-html'){
                        node.innerHTML = this._data[attrValue];
                        //当观察的属性对应的值发生变化时，会触发set
                        new Watcher(this._data,attrValue,newValue=>{
                            node.innerHTML = newValue;
                        })
                    }else if(attrName === 'v-text'){
                        node.innerText = this._data[attrValue];
                        new Watcher(this._data,attrValue,newValue=>{
                            node.innerText = newValue;
                        })
                    }
                })
                if(node.childNodes.length >0){
                    this.compileNodes(node);
                }
                
            }else if(node.nodeType === 3){
                //文本节点
                let reg = /\{\{\s*([^{}\s]+)\s*\}\}/g;
                //\s*匹配0个或多个空格，^表示以...开头，但在集合中表示除了...情况之外。
                let textContent = node.textContent;   
                if(reg.test(textContent)){
                    let $1 = RegExp.$1
                    node.textContent = node.textContent.replace(reg,this._data[$1]);
                    //监听事件
                    // this.addEventListener($1,(e)=>{
                    //     console.log('事件监听',e);
                    //     let oldValue = this._data[$1];
                    //     let newValue = e.detail;
                    //     node.textContent = node.textContent.replace(oldValue,newValue);
                    // })
                    new Watcher(this._data,$1,(newValue)=>{
                        console.log('视图渲染');
                        let oldValue = this._data[$1];
                        node.textContent = node.textContent.replace(oldValue,newValue);
                    })
                }
            }
        })
    }
}
class Dep{
    constructor(){
        this.subs = [];
    }
    add(sub){
        this.subs.push(sub);
    }    
    notify(newValue){
        this.subs.forEach(sub=>{
            sub.updata(newValue);
        })
    }
}
class Watcher{
    constructor(data,key,cb){
        
        Dep.target = this;
        data[key];//调用get
        this.cb = cb;
        //防止数据叠加
        // Dep.target = null;
    }
    updata(newValue){
        this.cb(newValue);
    }

}