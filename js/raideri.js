var basket = {
  items: []
}

$(document).keyup(function(e) {
  var esc = 27
  if (e.keyCode == esc) {
    $('#search')
      .val("")
      .next('.icon_clear').fadeTo(300, 0)
      .prev('input').val('')
      .trigger('keyup')
      .focus()
    return false
  }
})

$(window).load(function() {
  addItemsFromUrl()
  validateInputFields()
  updateBasketHtml()
  $("input[id='search']").focus()

  function addItemsFromUrl() {
    var kplArray = getQueryVariable('kpl')
    var eanArray = getQueryVariable('ean')
    var client = getQueryVariable('client')
    var name = getQueryVariable('name')
    var address = getQueryVariable('address')

    $.getJSON('products.json', function (data) {
      for (var i in eanArray) {
        var kpl = kplArray[i]
        ean = eanArray[i]
        for (j = 0; j < kpl; j++)
          addToBasket(ean)
      }
    })
    $('#name').val(decodeURIComponent(name))
    $('#client').val(decodeURIComponent(client))
    $('#address').val(decodeURIComponent(address))
  }

  function getQueryVariable(variable) {
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


  $('#search').keyup(function() {
    var searchTerm = $('#search').val()
    var opacity = searchTerm.length ? 1 : 0
    $('#search').next('.icon_clear').stop().fadeTo(300, opacity)
    $.getJSON('products.json', function(data) {
      listSearchResults(searchTerm, data)
    })
  })

  $('#search').trigger('keyup')

  function listSearchResults(searchTerm, data) {
    var regex = new RegExp(searchTerm, "i")
    var productCount = 0
    var result = $('#productResultTemplate')
    var resultsList =  $('#results .list')
    resultsList.html('')
    $.each(data, function(key, val) {
      if ((val.nimike.search(regex) != -1) || (val.kuvaus.search(regex) != -1) || (val.hakusanat.search(regex) != -1)) {
        hiliteterm = searchTerm.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*")
        var pattern = new RegExp("(" + hiliteterm + ")", "gi")
        result.find('.productresult')
          .prop('id', val.ean)
        result.find('.ean')
          .prop('value',  val.ean)
        result.find('.nimike')
          .html(val.nimike.replace(pattern, "<mark>$1</mark>"))
          .attr('data-value', val.nimike)
        result.find('.kuvaus')
          .attr('data-value', val.kuvaus)
          .html(val.kuvaus.replace(pattern, "<mark>$1</mark>"))
        result.find('.hinta')
          .html(val.hinta)
        result.find('img')
          .prop('src', "./img/"+val.ean+".jpg")
          .prop('alt', val.nimike)
        resultsList.append(result.html())
        productCount++
      }
    })
    if (productCount === 0) {
      result.find('img').prop('src', "./img/suurkeke.png").prop('alt', "keke")
      result.find('.kuvaus, .ean').remove()
      if (searchTerm.indexOf("kalja") >= 0 || searchTerm.indexOf("olut") >= 0 )
        result.find('.nimike').html('JUOPPO!').prop('data-value', 'keke')
      else
        result.find('.nimike').html('HAHAHA EI LÖYTYNYT!').prop('data-value', 'keke')
      resultsList.append(result.html())
    }
  }

  $('.icon_clear').click(function() {
    $(this).delay(300).fadeTo(300, 0)
      .prev('input').val('')
    $('#search').focus().trigger('keyup')
  })

  $('#results').on('click', '.productresult', function(e) {
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
    $.getJSON('products.json', function (data) {
      $.each(data, function (key, val) {
        if (val.ean.search(eanToAdd) != -1) {
          var item = {
            nimike: val.nimike,
            ean: val.ean,
            kuvaus: val.kuvaus,
            kpl: 1,
            hinta: val.hinta
          }
          var increased = false
          for (var i = 0; i < basket.items.length; i++) {
            if (basket.items[i].ean == eanToAdd) {
              basket.items[i].kpl++
              increased = true
            }
          }
          if (!increased) {
            basket.items.push(item)
          }
        }
      })
      updateBasketHtml()
    })
  }

  function markBasketItems() {
    var productList = $('#results .list')
    var products = productList.find('.productresult')

    for(j in basket.items) {
      var basketItem = basket.items[j]
      var basketItemEan = basketItem.ean

      for (i=0; i < products.length; i++) {
        var item = productList.find('.productresult:eq('+i+')')
        var ean = item.attr('id')
        if (ean == basketItemEan) {
          item.addClass('inBasket')
          item.find('.selected').html(basketItem.kpl)
          break
        }
      }
    }
  }

  $('#basket').on('click', '.reduce', function() {
    var ean = $(this).attr("data-ean-remove")
    removeFromBasket(ean)
  })

  function unmarkItem(ean) {
    var productList = $('#results .list')
    var products = productList.find('.productresult')
    for (i = 0; i < products.length; i++) {
      var product = productList.find('.productresult:eq(' + i + ')')
      var productEan = product.attr('id')
      if (ean == productEan) {
        product.removeClass('inBasket')
        product.find('.selected').html('')
        break
      }
    }
  }

  function removeFromBasket(ean) {
    for (var i = 0; i < basket.items.length; i++) {
      if (basket.items[i].ean == ean) {
        if (basket.items[i].kpl == 1) {
          basket.items.splice(i, 1)
          unmarkItem(ean)
        } else {
          basket.items[i].kpl--
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
      var amount = basket.items[i].kpl
      totalPrice += parseFloat(numberPrice * amount)
    }
    var niceNumber = totalPrice.toFixed(2).replace('.',',').concat(' €')
    return niceNumber
  }

  function updateBasketHtml() {
    var basketContents = $('#basketcontents')
    basketContents.html('')
    var item = $('#basketItemTemplate')
    $.each(basket.items, function(index, value) {
      item.find('.reduce').attr('data-ean-remove', value.ean)
      item.find('.amount').html(value.kpl + ' kpl')
      item.find('.productName').html(value.nimike)
      item.find('.description').html(value.kuvaus)
      basketContents.append(item.html())
    })
    basketContents.append("<p class='totalPrice'>Yhteensä: "+ countTotalPrice() +"</p>")
    if ($('#basketcontents .itemRow').length == 0)
      basketContents.html('Ostoskori on tyhjä')
    createUrlToBasket()
    markBasketItems()
  }

  function createUrlToBasket() {
    var newUrlEnd = ''
    for (i=0; i<basket.items.length; i++) {
      var kpl = basket.items[i].kpl
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

    console.log(newUrlEnd)

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
      basketitems += basket.items[i].kpl + ' kpl ' + basket.items[i].nimike + ' ' +  basket.items[i].kuvaus + ' (' + basket.items[i].ean + ')\n'
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


