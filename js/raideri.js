var basket = {
  items: []
}

var catalogue = {
  items: []
}

$(document).keyup(function(e) {
  var esc = 27
  if (e.keyCode == esc) {
    console.log("esc")
    $('#search')
      .trigger('keyup')
      .focus()
      .val('')
      .next('.icon_clear').fadeTo(200, 0)
    return false
  }
})

$(window).load(function() {
  createCatalogue()
  validateInputFields()
  updateBasketHtml()
  $("input[id='search']").focus()

  function createCatalogue() {
    $.getJSON('products.json', function (data) {
      $.each(data, function (key, val) {
        var item = {
          nimike: val.nimike,
          ean: val.ean,
          kuvaus: val.kuvaus,
          hinta: val.hinta,
          hakusanat: val.hakusanat,
          inBasket: 0
        }
        catalogue.items.push(item)
      })
      listAllProducts()
      addItemsFromUrl()
    })
  }

  function addItemsFromUrl() {
    var kplArray = getURLVariable('kpl')
    var eanArray = getURLVariable('ean')
    var client = getURLVariable('client')
    var name = getURLVariable('name')
    var address = getURLVariable('address')

    for (var i in eanArray) {
      var kpl = kplArray[i]
      var ean = eanArray[i]
      for (i = 0; i < kpl; i++)
        addToBasket(ean)
    }

    $('#name').val(decodeURIComponent(name))
    $('#client').val(decodeURIComponent(client))
    $('#address').val(decodeURIComponent(address))
  }

  function getURLVariable(variable) {
    var query = window.location.search.substring(1)
    var vars = query.split("&")
    var retval = []
    for (var i=0; i<vars.length; i++) {
      var pair = vars[i].split("=")
      if(pair[0] == variable)
        retval.push(pair[1])
    }
    return retval
  }

  function listAllProducts() {
    var productList = $('#results')
    var productItem = $('#productResultTemplate')
    for (i in catalogue.items) {
      item = catalogue.items[i]
      productItem.find('.productresult')
        .prop('id', item.ean)
      productItem.find('.ean')
        .prop('value', item.ean)
      productItem.find('.nimike')
        .html(item.nimike)
        .attr('data-value', item.nimike)
      productItem.find('.kuvaus')
        .attr('data-value', item.kuvaus)
        .html(item.kuvaus)
      productItem.find('.hinta')
        .html(item.hinta)
      productItem.find('img')
        .prop('src', "./img/" + item.ean + ".jpg")
        .prop('alt', item.nimike)
      productList.append(productItem.html())
    }
    addKeke()
    $('#keke').hide()
  }

  function addKeke() {
    var productList = $('#results')
    var productItem = $('#productResultTemplate')
    productItem.find('.productresult')
      .prop('id', 'keke')
    productItem.find('.nimike')
      .html("HA HA HA EI LÖYTYNYT!")
    productItem.find('img')
      .prop('src', "./img/suurkeke.png")
    productList.append(productItem.html())
  }


  $('#search').keyup(function() {
    var searchTerm = $('#search').val()
    var opacity = searchTerm.length ? 1 : 0
    $('.icon_clear').stop().fadeTo(200, opacity)
    listSearchResults(searchTerm)
  })

  function listSearchResults(searchTerm) {
    $('#search').val('')
    var searchTermRegex = new RegExp(searchTerm, "i")
    var productCount = 0
    var product = $('.productresult')
    product.hide()

    for (i in catalogue.items) {
      var item = catalogue.items[i]
      if (item.nimike.search(searchTermRegex) != -1 || (item.kuvaus.search(searchTermRegex) != -1) || (item.hakusanat.search(searchTermRegex) != -1)) {
        var selector = '#' + item.ean
        var foundItem = $('.productresult' + selector)
        var match = item.nimike.match(searchTermRegex) // TAI KUVAUS TAI HAKUSANAT!!!

        if (showOnlyBasketContents()) {
          if (foundItem.hasClass('inBasket'))
            foundItem.show()
        } else
          foundItem.show()

        foundItem.find('.nimike')
          .html(item.nimike.replace(searchTermRegex, "<mark>" + match + "</mark>"))
        foundItem.find('.kuvaus')
          .html(item.kuvaus.replace(searchTermRegex, "<mark>" + match + "</mark>"))
        productCount++
      }
    }
    if (productCount === 0) {
      $('#keke').show()
      if (searchTerm.indexOf("kalja") >= 0 || searchTerm.indexOf("olut") >= 0 )
        $('#keke .nimike').html('JUOPPO!')
      else
        $('#keke .nimike').html('HAHAHA EI LÖYTYNYT!')
    }
  }

  function showOnlyBasketContents() {
    return $('#showOnlyBasketContents').hasClass('active')
  }

  $('#showOnlyBasketContents').click(function() {
    $(this).toggleClass('active')
    listSearchResults('')
  })

  $('.icon_clear').click(function() {
    hideClearIcon()
    $('#search').focus()
    listSearchResults()
  })

  function hideClearIcon() {
    $('.icon_clear').delay(100).fadeTo(300, 0)
  }

  $('#results').on('click', '.productresult', function() {
    var ean = $(this).attr("id")
    $(this).fadeIn(50).fadeOut(50).fadeIn(200)
    addToBasket(ean)
  })

  $('.rightColumn input[type=text], .rightColumn textarea').each(function() {
    $(this).keyup(function() {
      createUrlToBasket()
      validateInputFields()
    })
  })

  function validateInputFields() {
    $('.rightColumn input[type=text], .rightColumn textarea').each(function() {
      if ($(this).val() == '')
        $(this).addClass('invalid')
      else
        $(this).removeClass('invalid')
    })
    checkIfCanBeSent()
  }

  function checkIfCanBeSent() {
    if ($('.rightColumn .invalid').length == 0)
      $('input:button#sendorder').removeAttr('disabled')
    else
      $('input:button#sendorder').attr('disabled', 'disabled')
  }

  function addToBasket(eanToAdd) {
    for (i in catalogue.items) {
      var item = catalogue.items[i]
      if (item.ean == eanToAdd) {
        item.inBasket++
        var increased = false
        for (j in basket.items) {
          var basketItem = basket.items[j]
          if (basketItem.ean == eanToAdd) {
            basketItem.inBasket = item.inBasket
            increased = true
          }
        }
        if (!increased)
          basket.items.push(item)
        updateBasketHtml()
        break
      }
    }
  }

  function markBasketItems() {
    var productList = $('#results')
    var products = productList.find('.productresult')

    for(j in basket.items) {
      var basketItem = basket.items[j]
      var basketItemEan = basketItem.ean

      for (i=0; i < products.length; i++) {
        var item = products[i]
        var ean = item.id
        if (ean == basketItemEan) {
          item.classList.add('inBasket')
          item.querySelector('.selected').innerHTML = basketItem.inBasket
          break
        }
      }
    }
  }

  $('#basket').on('click', '.reduce', function() {
    var ean = $(this).attr("data-ean-remove")
    removeFromBasket(ean)
  })

  function unmarkItem(basketEan) {
    var productList = $('#results')
    var products = productList.find('.productresult')
    for (i = 0; i < products.length; i++) {
      var item = products[i]
      var ean = item.id
      if (basketEan == ean) {
        item.classList.remove('inBasket')
        item.querySelector('.selected').innerHTML = ''
        break
      }
    }
  }

  function removeFromBasket(ean) {
    for (var i = 0; i < basket.items.length; i++) {
      if (basket.items[i].ean == ean) {
        if (basket.items[i].inBasket == 1) {
          basket.items.splice(i, 1)
          unmarkItem(ean)
        } else {
          basket.items[i].inBasket--
          reduced = true
        }
      }
    }
    $('.urlToBasket').toggle(basket.items.length > 0)
    updateBasketHtml()
  }

  function emptyBasket() {
    var basketSize = basket.items.length
    basket.items.splice(0, basketSize)
    $('.productresult').removeClass('inBasket')
    updateBasketHtml()
  }

  function countTotalPrice() {
    var totalPrice = 0
    for (i in basket.items) {
      var item = basket.items[i]
      if (item.hinta != '')
        var price = item.hinta
      else price = '0'
      var numberPrice = parseFloat(price.replace(',','.'))
      var amount = basket.items[i].inBasket
      totalPrice += parseFloat(numberPrice * amount)
    }
    var niceNumber = totalPrice.toFixed(2).replace('.',',').concat(' €')
    return niceNumber
  }

  function updateBasketHtml() {
    var basketContents = $('#basketcontents')
    basketContents.html('')
    var htmlItem = $('#basketItemTemplate')
    for (i in basket.items) {
      var item = basket.items[i]
      htmlItem.find('.reduce').attr('data-ean-remove', item.ean)
      if (item.hinta == '')
        tidyPrice = '?'
      else {
        var parsedPrice = parseFloat(item.hinta.replace(',', '.'))
        var itemTotal = item.inBasket * parsedPrice
        var tidyPrice = itemTotal.toFixed(2).replace('.', ',').concat(' €')
      }
      htmlItem.find('.amount').html(item.inBasket + " kpl")
      htmlItem.find('.itemTotalPrice').html("= " + tidyPrice)
      htmlItem.find('.productName').html(item.nimike)
      htmlItem.find('.description').html(item.kuvaus)
      basketContents.append(htmlItem.html())
    }
    basketContents.append("<p class='totalPrice'>Yhteensä: "+ countTotalPrice() +"</p>")
    if ($('#basketcontents .itemRow').length == 0)
      basketContents.html('Ostoskori on tyhjä')
    createUrlToBasket()
    markBasketItems()
  }

  function createUrlToBasket() {
    var newUrlEnd = ''
    for (i=0; i<basket.items.length; i++) {
      var kpl = basket.items[i].inBasket
      var ean = basket.items[i].ean
      newUrlEnd += "&kpl="+kpl+"&ean="+ean
    }
    var name = encodeURIComponent($('#name').val())
    var client = encodeURIComponent($('#client').val())
    var address = encodeURIComponent($('#address').val())
    newUrlEnd += "&name="+name+"&client="+client+"&address="+address

    var currentUrl = window.location.href.split('?')[0]
    newUrlEnd = newUrlEnd.split(/&(.+)?/)[1] // take out first '&'
    var newUrl = currentUrl + "?" + newUrlEnd

    $('.urlToBasket').toggle(basket.items.length > 0)
    $('.emptyBasket').toggle(basket.items.length > 0)
    $('.urlToBasket').html("<a href="+newUrl+">Linkki koriin</a>")
  }

  $('.emptyBasket').click(function() {
    emptyBasket()
  })

  $('#sendorder').click(function(e) {
    var email = 'kespro.myynti@kesko.fi'
    var cc = 'ostot@reaktor.fi'
    var subject = 'Reaktorin tilaus asiakkuutteen '+ $('#client').val()
    var body = 'Hei, tässä tämänkertainen tilaus asiakkuuteen '+ $('#client').val() +' osoitteeseen ' + $('#address').val() + '.\n\n Tilauksen vastaanottamisessa auttavat: \n'+$('#name').val()+' \n\nTilauksen sisältö: \n\n'

    var basketitems = ''
    for (var i = 0; i < basket.items.length; i++) {
      basketitems += basket.items[i].inBasket + ' kpl ' + basket.items[i].nimike + ' ' +  basket.items[i].kuvaus + ' (' + basket.items[i].ean + ')\n'
    }

    if (basketitems.length > 1200){
      $("#ex1").html("<p>Ostoslista on liian pitkä, kopioi se alta ja liitä viestiin.</p><br/><br/><p class=\"modal\">" + basketitems.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</p><br/><br/><a href="mailto:' + email + '?cc=' + cc + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '" >Avaa sähköposti tästä</a><br/><br/><a rel="modal:close">Sulje</a>')
      $("#ex1").modal({
        fadeDuration: 200,
        showClose: false
      })
    }
    else{
      window.location = 'mailto:' + email + '?cc=' + cc + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body + basketitems)
    }
  })

})
