const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express")
const app = express()

app.set('view engine', 'ejs')
 
async function getProducts() {
  try {
    const url =
      "https://www.digitec.ch/de/s1/producttype/monitor-31?tagIds=77-624&take=192";
 
    const { data } = await axios({
      method: "GET",
      url: url,
    });
 
    const $ = cheerio.load(data);
    const elemSelector =
      "#productListingContainer > div.sc-1f6e68i-0.McWar > article "; //> div.panelLayout_rightBottomHalf__1tXAZ > div
    const arr = []
 
    $(elemSelector).each((parentIdx, parentElem) => {
      const prodObj = {};
      $(parentElem)
        .children()
        .each((childIdx, childElem) => {
          let item = {}
          item.Name = $(childElem).find("div.panelLayout_rightBottomHalf__1tXAZ > div > div.sc-11iaj9w-0.fXxQZV.hxnpc3-1.WEqJR > strong").text().trim()
          item.Model = $(childElem).find("div.sc-11iaj9w-0.fXxQZV.hxnpc3-1.WEqJR > span").text();
          item.Price = Number($(childElem).find("div.panelLayout_priceEnergyWrapper__eX2Hi > span.jpymmj-0.gAPiWy.bn4s2g-0.gZsIHL > strong").text().replace(/[^0-9.-]+/g, ""));
          item.Energy = $(childElem).find("div.panelLayout_priceEnergyWrapper__eX2Hi > span > label").text();
          item.Link = $(childElem).attr('href')
          item.Image = $(childElem).find("div.panelLayout_leftTopHalf__1bwFV > div > div.t5iqm2-0.bAhlTk.j6e7w3-0.TftNu > picture > img").attr("src")
 
          for (let index in item) {
            if (item[index]) {
              prodObj[index] = item[index];
            }
          }
 
        });
      arr.push(prodObj)
      arr.forEach((item, i) => {
        item.id = item.Link.match(/monitor-(\d+)/)[1];
      });
    });
    return arr
  } catch (error) {
    console.log(error);
  }
}

async function getProduct(product) {
  try {
    const url = `https://www.digitec.ch/${product}`

    const { data } = await axios({
      method: "GET",
      url: url,
    })
    const $ = cheerio.load(data);
    const elemSelector = "#pageContent"
    let arr = []

    $(elemSelector).each((parentIdx, parentElem) => {
      const title = $(parentElem).find("div > div.header_container__1ob07.helpers_fixGridLayout__iRmw0 > div > div.header_data__k39sv > div > h1").text();
      const brand = $(parentElem).find("div > div.header_container__1ob07.helpers_fixGridLayout__iRmw0 > div > div.header_data__k39sv > div > h1 > strong").text();
      const reaction = $(parentElem).find("div.sc-1dj0gc8-2.ezYZiH.sc-1wsbwny-0.pvTwK > div > div > div > table > tbody > tr:nth-child(3) > td:nth-child(2) > div").text()
      const image = $(parentElem).find("div > div > picture > img").attr("src");
      const price = Number($(parentElem).find("div > div.header_container__1ob07.helpers_fixGridLayout__iRmw0 > div > div.header_data__k39sv > div > div.sc-1nkkyhu-3.isGLtI > span.sc-1nkkyhu-8.yGeXx > strong").text().replace(/[^0-9.-]+/g, ""))
      const desc = $(parentElem).find("div > div > div.sc-1dj0gc8-2.ezYZiH.sc-1wsbwny-0.pvTwK > div").text();
      const frequency = $(parentElem).find("div > div> div.sc-1dj0gc8-2.ezYZiH.sc-1wsbwny-0.pvTwK > div > div > div > table > tbody > tr:nth-child(4) > td:nth-child(2) > div").text();
      const resolution = $(parentElem).find('div > div.header_container__1ob07.helpers_fixGridLayout__iRmw0 > div > div.header_data__k39sv > div > span').text();
      const brightness = $(parentElem).find('div > div > div.sc-1dj0gc8-2.ezYZiH.sc-1wsbwny-0.pvTwK > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div').text();
      const prod = {
        title: title,
        brand: brand,
        reaction: reaction,
        image: image,
        price: price,
        desc: desc,
        frequency: frequency,
        resolution: resolution,
        brightness: brightness
      }
      arr.push(prod);
    })
    console.log(arr)
    return arr
  } catch (error) {
    console.log(error);
  }
}

app.get('/', async (req, res) => {
  try {
    const printRes = await getProducts()
    console.log(printRes)
    res.render('html', {articles: printRes})
  } catch (error) {
    console.log(error)
  }
})

app.get('/product/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await getProducts()
    const filt = product.filter(product => product.id == id);
    console.log(filt)
    const result = await getProduct(filt[0].Link);

    res.render('show', {articles: result});
  } catch (error) {
    console.log(error)
  }
})

app.listen(3000, console.log(`Server is running on http://localhost:3000`));