var axios = require('axios');
var RSS = require('rss');
var cheerio = require("cheerio")
const debug = require('debug')('server:routes:index')
// let feedOptions  = {
//     title: 'RSS Maker',
//     description: 'RSS Maker',
//     feed_url: 'http://localhost:3000/rss',
//     site_url: 'http://localhost:3000',
//     image_url: 'http://localhost:3000/logo.png',
// }
// var feed = new RSS(feedOptions);
// var xml = feed.xml({indent: true});
// console.log(xml)
async function getSidOfStaticFile() {
    var url = 'https://mirror.xyz/'
    return axios.get(url).then(function (res) {
        let sIdx = res.data.search('buildId');
        let buildId = res.data.slice(sIdx + 10, sIdx + 31)
        debug(`Get buildId: ${buildId}`)
        return buildId
    })
}

async function gen_rss_from_json(json_url) {
    return axios.get(json_url).then(function (res) {
        let json_data = res.data
        console.log(json_data)
        let pageProps = json_data.pageProps

        let address = pageProps.project.address;
        let author = pageProps.project.displayName;
        let description = pageProps.project.description;
        let title = pageProps.project.title;
        let logo = pageProps.project.logo;
        let rss_url = pageProps.project.rss_url;
        let rss_title = pageProps.project.rss_title;

        let feed = new RSS({
            link: `https://mirror.xyz/${address}`,
            title: `${author} - Mirror.xyz`,
            generator: 'Mirror.xyz',
        });
        let items = []
        for (let i = 0; i < pageProps.project.posts.length; i++) {
            feed.item({
                title: pageProps.project.posts[i].title,
                description: pageProps.project.posts[i].body.slice(0, 50),
                link: `https://mirror.xyz/${address}/${pageProps.project.posts[i].originalDigest}`,
                date: Date.parse(pageProps.project.posts[i].timestamp),
                guid: pageProps.project.posts[i].originalDigest,
                custom_elements: [
                    { "content:encoded": pageProps.project.posts[i].body }
                ]
            });
        }

        xml = feed.xml({ indent: true });
        return xml

    }).catch((err) => {
        if (err.isAxiosError) {
            if (err.code == undefined) {
                debug(`response.status: ${err.response.status}`)

                return ""
            } else {
                debug(`axios internal error, code: ${err.code}`)
                return ""
            }
        } else {
            console.error(err)
            return ""
        }
    })

}


async function gen_rss_from_page(url) {
    return axios.get(url).then(function (res) {
        debug(`fetched data length: ${res.data.length}`)
        var $ = cheerio.load(res.data);
        let title = $('title').text()
        let description = $('meta[name="description"]').attr('content')
        let link = $('link').attr('href')
        let pubDate = $('meta[name="pubdate"]').attr('content')
        let author = $('meta[name="author"]').attr('content')
        let image = $('meta[property="og:image"]').attr('content')
        let articals = $('#__next > div._1sjywpl0._1sjywpl1.bc5nciih.bc5ncisr.bc5nci36q > div > div').children()

        let items = []
        for (let i = 0; i < articals.length; i++) {
            let item = new Object()
            let artical = articals[i]
            if ($(artical).children().length == 0) {
                debug(`div ${i} is empty`)
                continue
            }
            let title = $(artical).children().eq(0).find('h1').text()
            console.log(title)
            console.log($(artical).children().eq(0).html())
            let attr = $(artical).children().eq(1).children().eq(0).children().children()
            // console.log(title)
            // console.log($(attr).eq(0).attr('href'))
            // console.log($(attr).eq(1).text())
            // console.log($(attr).eq(2).find('a').attr('href'))

            let link = $(attr).eq(2).find('a').attr('href')
            let description = $(artical).children().eq(2).text()
            let pubDate = Date.parse($(attr).eq(1).text().replace(/th|st|nd/g, ''))
            let author = $(artical).find('span').text()
            // console.log(title, link, description, pubDate, author)
            item.title = title
            // item.link = link
            // item.description = description
            item.pubDate = pubDate
            item.author = author
            items.push(item)
        }

        let feed = new RSS({
            title: title,
            description: description,
        });
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            feed.item({
                title: item.title,
                description: item.description,
                url: item.link,
                date: item.pubDate,
            });
        }
        xml = feed.xml({ indent: true });
        return xml
    }).catch((err) => {
        if (err.isAxiosError) {
            if (err.code == undefined) {
                console.warn(err.response.status)
                return ""
            } else {
                console.error(`axios internal error, code: ${err.code}`)
                return ""
            }
        } else {
            console.error(err)
            return ""
        }
    })
}

async function genRssOfAccount(account) {
    let cache = contentCache(account)
    if(cache){
        return cache
    } else {
        let buildId = await getSidOfStaticFile();
        json_url = `https://mirror.xyz/_next/data/${buildId}/_sites/${account}.json`
        let result = gen_rss_from_json(json_url)
        contentCache(account, result)
        return result
    }
   
}

let gCachePool = {}
function contentCache(key, value) {
    if (value == undefined) {
        debug(`get cache: ${key}`)
        return gCachePool[key]
    } else {
        debug(`set cache: ${key}`)
        gCachePool[key] = value
        return value
    }
}

async function timerToRefreshCache() {
    const TTL = 300;
    debug('started cache refreshing task...')
    let timer = setInterval(async function () {
        gCachePool = {}
        debug('refreshing cache')
    }, 1000 * TTL)
}

async function main() {
    // let a = await genRssOfAccount(account);
    // console.log(a)
    getSidOfStaticFile()
}

// main().catch((err) => {console.error(err)})

module.exports = {
    genRssOfAccount,
    timerToRefreshCache
}