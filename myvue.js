

class Vue extends EventTarget{
    constructor(options){
        super();
        this.$options = options;
        this._data = options.data;
        this.observe(this._data);
        this.compile();
    }
    observe(){
        let temp = {};
        this._data = new Proxy(data,{
            get(target,key){
                temp[key] = new Dep();
                if(Dep.target){
                    temp[key] = dep.add(Dep.target);
                }
                return Reflect.get(target,key)
            },
            set(target,key,newValue){
                return Reflect.set(target,key,newValue);
            }
        })
    }
    // observe(data){
    //     let _this = this;
    //     let keys = Object.keys(data);
    //     keys.forEach(key=>{
    //         let value = data[key]
    //         Object.defineProperty(data,key,{
    //             configurable:true,
    //             enumerable:true,
    //             get(){
    //                 console.log('get');
    //                 return value;
    //             },
    //             set(newValue){
    //                 console.log('set',newValue);
    //                 //触发事件
    //                 _this.dispatchEvent(new CustomEvent(key,{detail:newValue}));
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
                if(node.childNodes.length >0){
                    this.compileNodes(node);
                }
                //元素节点
            }else if(node.nodeType === 3){
                //文本节点
                let reg = /\{\{\s*([^{}\s]+)\s*\}\}/g;
                //\s*匹配0个或多个空格，^表示以...开头，但在集合中表示除了...情况之外。
                let textContent = node.textContent;   
                if(reg.test(textContent)){
                    let $1 = RegExp.$1
                    node.textContent = node.textContent.replace(reg,this._data[$1]);
                    //监听事件
                    this.addEventListener($1,(e)=>{
                        console.log('事件监听',e);
                        let oldValue = this._data[$1];
                        let newValue = e.detail;
                        node.textContent = node.textContent.replace(oldValue,newValue);
                    })
                }
            }
        })
    }
}