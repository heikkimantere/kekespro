var basket = {
  items: []
}

var catalogue = {
  items: []
}

$(window).load(function() {
  createCatalogue()
  updateBasketHtml()
  $("input[id='search']").focus()

  $(document).keyup(function(e) {
    var esc = 27
    if (e.keyCode == esc) {
      $('#search')
        .trigger('keyup')
        .focus()
        .val('')
        .next('.icon_clear').fadeTo(100, 0)
      listSearchResults()
      return false
    }
  })

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
      validateInputFields()
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
    $('#showOnlyBasketContents').prop('checked', false)
    var searchTerm = $('#search').val()
    var opacity = searchTerm.length ? 1 : 0
    $('.icon_clear').stop().fadeTo(100, opacity)
    listSearchResults(searchTerm)
  })

  function listSearchResults(searchTerm) {
    $('#search').val(searchTerm)
    var searchTermRegex = new RegExp(searchTerm, "i")
    var productCount = 0
    var product = $('.productresult')
    product.hide()

    for (i in catalogue.items) {
      var item = catalogue.items[i]
      var selector = '#' + item.ean
      var foundItem = $('.productresult' + selector)

      if (item.nimike.search(searchTermRegex) != -1 || (item.kuvaus.search(searchTermRegex) != -1) || (item.hakusanat.search(searchTermRegex) != -1)) {
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
    return $('#showOnlyBasketContents').is(':checked')
  }

  function toggleShowOnlyBasketContents(value) {
    if (value == false)
      $('#showOnlyBasketContents').prop('checked', false)
    else
      $('#showOnlyBasketContents').prop('checked', true)
    listSearchResults()
  }

  $('#showOnlyBasketContents').click(function() {
    listSearchResults()
  })

  $('.icon_clear').click(function() {
    hideClearIcon()
    $('#search').focus()
    listSearchResults()
  })

  function hideClearIcon() {
    $('.icon_clear').delay(100).fadeTo(100, 0)
  }

  $('#results').on('click', '.productresult', function() {
    var ean = $(this).attr("id")
    flash($(this))
    addToBasket(ean)
  })
  $('#results').on('click', '.productresult .minus', function(e) {
    var item = $(this).parent().parent()
    var ean = item.attr("id")
    e.stopPropagation()
    if (item.find('.amount').text() > 0) {
      flash(item)
      removeFromBasket(ean)
    }
  })

  function flash(item) {
    item.stop(true, true).fadeTo(10, 1).fadeTo(15, .5).fadeTo(250, 1)
  }


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
        updateBasketHtml()
        break
      }
    }
  }

  function markBasketItems() {
    var productList = $('#results')
    var products = productList.find('.productresult')

    var basketItems = returnBasketItems()
    for (i in basketItems) {
      var basketItem = basketItems[i]
      var basketItemEan = basketItem.ean
      for (j=0; j < products.length; j++) {
        var item = products[j]
        var ean = item.id
        if (ean == basketItemEan) {
          item.classList.add('inBasket')
          item.querySelector('.amount').innerHTML = basketItem.inBasket
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
        item.querySelector('.amount').innerHTML = ''
        break
      }
    }
  }

  function removeFromBasket(ean) {
    var basketItems = returnBasketItems()
    for (i in basketItems) {
      var basketItem = basketItems[i]
      if (basketItem.ean == ean)
        basketItem.inBasket--
      if (basketItem.inBasket == 0) {
        unmarkItem(ean)
        listSearchResults()
      }
    }
    $('.urlToBasket').toggle(basket.items.length > 0)
    updateBasketHtml()
  }

  function emptyBasket() {
    var basketItems = returnBasketItems()
    for (i in basketItems)
      basketItems[i].inBasket = 0
    $('.productresult').removeClass('inBasket')
    toggleShowOnlyBasketContents(false)
    updateBasketHtml()
  }

  function returnBasketItems() {
    var basketItems = []
    for (i in catalogue.items) {
      var item = catalogue.items[i]
      if (item.inBasket > 0)
        basketItems.push(item)
    }
    return basketItems
  }

  function countTotalPrice() {
    var totalPrice = 0
    var basketItems = returnBasketItems()
    for (i in basketItems) {
      var item = basketItems[i]
      if (item.hinta != '')
        var price = item.hinta
      else price = '0'
      var numberPrice = parseFloat(price.replace(',','.'))
      var amount = basketItems[i].inBasket
      totalPrice += parseFloat(numberPrice * amount)
    }
    return niceNumber = totalPrice.toFixed(2).replace('.',',').concat(' €')
  }

  function updateBasketHtml() {
    var basketHTML = $('#basketcontents')
    basketHTML.html('')
    var htmlItem = $('#basketItemTemplate')
    var basketItems = returnBasketItems()
    for (i in basketItems) {
      var basketItem = basketItems[i]
      htmlItem.find('.reduce').attr('data-ean-remove', basketItem.ean)
      if (basketItem.hinta == '')
        tidyPrice = '?'
      else {
        var parsedPrice = parseFloat(basketItem.hinta.replace(',', '.'))
        var itemTotal = basketItem.inBasket * parsedPrice
        var tidyPrice = itemTotal.toFixed(2).replace('.', ',').concat(' €')
      }
      htmlItem.find('.amount').html(basketItem.inBasket + " kpl")
      htmlItem.find('.itemTotalPrice').html("= " + tidyPrice)
      htmlItem.find('.productName').html(basketItem.nimike)
      htmlItem.find('.description').html(basketItem.kuvaus)
      basketHTML.append(htmlItem.html())
    }
    basketHTML.append("<p class='totalPrice'>Yhteensä: "+ countTotalPrice() +"</p>")
    if ($('#basketcontents .itemRow').length == 0)
      basketHTML.html('Ostoskori on tyhjä')
    createUrlToBasket()
    markBasketItems()
    returnBasketItems()
  }

  function createUrlToBasket() {
    var newUrlEnd = ''
    var basketItems = returnBasketItems()

    for (i in basketItems) {
      var item = basketItems[i]
      var kpl = item.inBasket
      var ean = item.ean
      newUrlEnd += "&kpl="+kpl+"&ean="+ean
    }
    var name = encodeURIComponent($('#name').val())
    var client = encodeURIComponent($('#client').val())
    var address = encodeURIComponent($('#address').val())
    newUrlEnd += "&name="+name+"&client="+client+"&address="+address

    var currentUrl = window.location.href.split('?')[0]
    newUrlEnd = newUrlEnd.split(/&(.+)?/)[1] // take out first '&'
    var newUrl = currentUrl + "?" + newUrlEnd

    $('.urlToBasket').toggle(basketItems.length > 0)
    $('.emptyBasket').toggle(basketItems.length > 0)
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

    if (basketitems.length > 1200) {
      $("#ex1").html("<p>Ostoslista on liian pitkä, kopioi se alta ja liitä viestiin.</p><br/><br/><p class=\"modal\">" + basketitems.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</p><br/><br/><a href="mailto:' + email + '?cc=' + cc + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '" >Avaa sähköposti tästä</a><br/><br/><a rel="modal:close">Sulje</a>')
      $("#ex1").modal({
        fadeDuration: 200,
        showClose: false
      })
    }
    else
      window.location = 'mailto:' + email + '?cc=' + cc + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body + basketitems)
  })

})
