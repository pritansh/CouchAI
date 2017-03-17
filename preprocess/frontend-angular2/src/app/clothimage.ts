export class ClothImage {
    name: String
    metaname: String
    extension: String
    filename: String
    data: Object
    constructor(name: String, data: Object) {
        if(Object.keys(data).length == 0) {
            let temp = name.split('-'),
                tmp = temp.slice(1).join('-').split('.')
            this.name = temp[0]
            this.metaname = tmp[0]
            this.extension = tmp.slice(1).join('.')
            this.filename = this.name + '-' + this.metaname + '.' + this.extension
            this.data = data
        }
        else {
            this.name = name
            this.data = data
        }
    }
}