var aff = require('flipkart-affiliate'),
    async = require('async'),
    fs = require('fs'),
    cp = require('child_process'),
    json_file = './json/flipkart-final.json',
    fkres = [],
    fkc = aff.createClient({
        FkAffId: 'rohitjais1',
        FkAffToken: '4cd13e5fd03e492fa8c61753da17a281',
        responseType: 'json'
    }),
    getCategoryFeedFlipkart = (retailerId) => {
        fkc.getCategoryFeed({
            trackingId: 'rohitjais1'
        }, (err, result) => {
            if (!err) {
                urlListObject = {
                    womens_clothing: JSON.parse(result).apiGroups.affiliate.apiListings.womens_clothing.availableVariants["v1.1.0"].top
                }
                getProductFeedFlipkart(urlListObject.womens_clothing, retailerId, 0)
            } else {
                console.log(err)
            }
        })
    },
    getProductFeedFlipkart = (url, retailerId, iteration) => {
        if (iteration < 300) {
            fkc.getProductsFeed({
                url: url
            }, (err, result) => {
                if (!err) {
                    nextUrl = JSON.parse(result).nextUrl
                    getProductFeedFlipkart(nextUrl, retailerId, iteration)
                } else {
                    console.log(err)
                }
            })
        }

        fkc.getProductsFeed({
            url: url
        }, (err, result) => {
            if (!err) {
                insertDataFlipkart(result, retailerId, iteration)
            } else {
                console.log(err)
            }
        })

        iteration++
    },
    insertDataFlipkart = (result, retailerId, page) => {
        try {
            data = require(json_file)
            fs.unlinkSync(json_file)
        } catch (error) {
            data = []
        }
        productList = JSON.parse(result).productInfoList
        async.eachSeries(productList, (product, callback) => {
            try {
                item = product.productBaseInfoV1
                data.push({
                    id: item.productId,
                    url: item.imageUrls.unknown,
                    class: item.productBrand.toLowerCase(),
                    model: item.categoryPath.substring(item.categoryPath.lastIndexOf('>') + 1).toLowerCase(),
                    color: item.attributes.color.toLowerCase(),
		    url: item.productUrl
                })
            } catch (error) {
                console.log(error)
            }
            callback()
        })
        fs.writeFileSync(json_file, JSON.stringify(data))
        console.log('Page ' + page, data.length)
    },
    check_dir = (dir_path) => {
        try {
            fs.statSync(dir_path)
        } catch (error) {
            if (error != null && error.code == 'ENOENT')
                fs.mkdirSync(dir_path)
        }
    },
    downloadData = (models) => {
        image_path = './img/flipkart'
        check_dir(image_path)
        async.eachSeries(models, (data, callback) => {
            length = data[1].length
            console.log('Downloading class -> ' + data[0] + ' files -> ' + length)
            done = 0
            async.eachSeries(data[1], (item, callback) => {
                try {
                    model_path = image_path + '/' + item.model
                    check_dir(model_path)
                    image_ext = ''
                    if (item.url && item.model) {
                        image_ext = item.url.substring(item.url.lastIndexOf('.'))
                        image = model_path + '/' + item.id + '-' + item.class + '-' + item.color + image_ext
                        try {
                            fs.statSync(image)
                        } catch (error) {
                            if (error != null && error.code == 'ENOENT') {
                                try {
                                    cp.execFileSync('curl', ['--silent', '-o', image, '-L', item.url], {
                                        encoding: 'utf8'
                                    })
                                } catch (error) {}
                            }
                        }
                        done++
                        perc = (((done * 1.0) / length) * 100).toFixed(2)
                        console.log('[' + perc + '%](' + done + '/' + length + ') ' + item.id + '-' + item.class + '-' + item.color + image_ext)
                    }
                    try {
                        callback()
                    } catch (error) {
                        console.log(error)
                    }
                } catch (error) {
                    console.log(error)
                }
            })
            console.log('Finished downloading class -> ' + data[0] + ' files -> ' + length)
            callback()
        })
    },
    filterData = (data) => {
        length = data.length
        models = [...new Set(data.map((item) => {
            return item.model
        }))].map((model) => {
            return [model, ]
        })
        async.eachSeries(models, (model, callback) => {
            model_data = data.filter((item) => {
                return item.model == model[0]
            })
            model[1] = model_data
            callback()
        })
        models = models.filter((model) => {
            return model[1].length >= 600
        })
        return models
    }

getCategoryFeedFlipkart()
/*
data = require('./json/flipkart.json')
models = filterData(data)
fs.writeFileSync('./json/final.json', JSON.stringify(models))
*/
//models = require('./json/final.json')
//console.log(models.length)
//downloadData(models[7])
