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
        item.id = i + 1;
      });
    });
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

app.get('/:id', async (req, res) => {
  try {
    const byId = req.params.id
    const result = await getProducts()

    const fin = result.filter(result => result.id == byId)

    res.render('show', {articles: fin});
  } catch (error) {
    console.log(error)
  }
})

app.listen(3000, console.log(`Server is running on http://localhost:3000`));