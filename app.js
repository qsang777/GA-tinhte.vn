const http = require('http')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fss = require('fs')
const app = express()
const PORT = process.env.PORT || 80

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use('/public', express.static(path.join(__dirname, 'static')))

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'))
})

app.post('/', (req,res) => {
  console.log(req.body[0].value) 
  console.log(req.body[1].value)

  var twirlTimer = (function() {
    var P = ["\\", "|", "/", "-"];
    var x = 0;
    return setInterval(function() {
      process.stdout.write("\r" + P[x++]);
      x &= 3;
    }, 250);
  })();

  const puppeteer = require('puppeteer')
  const fs = require('fs/promises')
  const { url } = require('inspector')
  const { request } = require('http')

  const baseUrl = req.body[0].value 

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(baseUrl)

    page.setDefaultNavigationTimeout(0)
    
    const names = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.jsx-3147581474.thread-title')).map(x => x.textContent)
    })

    var links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.jsx-691990575.thread-comment__author-container a:not(.thread-comment__date.jsx-691990575)')).map(x => "tinhte.vn" + x.getAttribute('href'))
    })

    var urls = []
    const pageNumb = req.body[1].value
    if (pageNumb >= 2) {
      for(i = 2; i <= pageNumb; i ++) {
        urls.push(baseUrl + "page-" + i)
      }

      for(i = 0; i < urls.length; i ++) {
        await page.goto(urls[i])
        var links2 = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.jsx-691990575.thread-comment__author-container a:not(.thread-comment__date.jsx-691990575)')).map(x => "tinhte.vn" + x.getAttribute('href'))
        })

        for(const x of links2) {
          links.push(x)
        }
        links2 = []
      }
    }

    var unique = links.filter(onlyUnique);
    for(i = 0; i< unique.length; i++){
      unique[i] = i + 1 + ". " + unique[i]
    }

    await fs.writeFile("results/GA.txt", unique.join("\r\n"),)
    
    await browser.close()

    var server = http.createServer(function(req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'})
      var myReadStream = fss.createReadStream(__dirname + '/results/GA.txt', 'utf8')
      myReadStream.pipe(res)
    })
    server.listen(3000, "127.0.0.1")
    res.json({status: "Success"})
  }
  start()

})
app.listen(3000)

