var GoogleSpreadsheet = require("google-spreadsheet");

// spreadsheet key is the long id in the sheets URL
var reaktorPrices = new GoogleSpreadsheet('1KxjtvW6ixmR5CgSY0yUKmari-GntYbeCwOwfyJnZwRE');
var products = [];
reaktorPrices.getRows(1, {"start-index": 0}, function(err, rows) {
  rows.forEach(function(row) {
    if(row.nimike !== "") {
      var obj = {};
      obj.nimike = row.nimike || "";
      obj.ean = row.ean || "";
      obj.pakkaus = row.pakkaus || "";
      obj.kpl = row.kpl || "";
      obj.pakkauskoko = row.pakkauskoko || "";
      obj.hakusanat = row.hakusanat || "";
      obj.hinta = row.hinta || "";

      // for apples bananas grapes carrots we need to override the non existing ean to get the images to work
      if(obj.nimike.trim() === "Banaani") obj.ean = "H001"
      if(obj.nimike.trim() === "Omena Jonagold") obj.ean = "H002"
      if(obj.nimike.trim() === "Omena Granny Smith") obj.ean = "H003"
      if(obj.nimike.trim() === "Rypäle Tumma Siemenetön") obj.ean = "H004"
      if(obj.nimike.trim() === "Rypäle Vihreä Siemenetön") obj.ean = "H005"
      if(obj.nimike.trim() === "Mini Porkkana") obj.ean = "H006"
      if(obj.nimike.trim() === "Miniluumutomaatti Punainen") obj.ean = "H007"
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
  console.log(JSON.stringify(products));
});
