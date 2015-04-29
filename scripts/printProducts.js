var GoogleSpreadsheet = require("google-spreadsheet");

// spreadsheet key is the long id in the sheets URL
var reaktorPrices = new GoogleSpreadsheet('1KxjtvW6ixmR5CgSY0yUKmari-GntYbeCwOwfyJnZwRE');
var products = [];
reaktorPrices.getRows(1, {"start-index": 0}, function(err, rows) {
  rows.forEach(function(row) {
    //console.log(row);
    if(row.tuote !== "") {
      var obj = {};
      obj.tuote = row.tuote;
      obj.ean = row.ean;
      obj.pakkaus = row.pakkaus;
      obj.kpl = row.kpl;
      obj.pakkauskoko = row.pakkauskoko;
      obj.hakusanat = row.hakusanat;
      obj.hinta = row.hinta;
      products.push(obj);
    }
  });

  // add some readable strings
  products = products.map(function(pr) {
    if(pr.pakkauskoko !== '' && pr.pakkaus !== 'kpl') pr.kuvaus = pr.kpl + " x " + pr.pakkaus + " " + pr.pakkauskoko;
    else if (pr.pakkaus === 'kg') pr.kuvaus = pr.kpl + pr.pakkaus
    else if (pr.pakkaus === 'kpl') pr.kuvaus = pr.kpl + " x " + pr.pakkauskoko
    return pr;
  });
  console.log(products);
});
