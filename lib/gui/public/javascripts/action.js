
$(document).ready(function () {

  $('.filter').click(function (event) {
    event.preventDefault()
    $('#filter').val($('#filter').val()+$(event.target).html()+' ').change()
  })

  $('#filter').change(function (event) {
    $('#search').submit()
  })

  $('.tasks tbody tr').each(function (i, row) {
    $(row).click(function (event) {
      if (event.target.tagName.toLowerCase() != 'a') {
        var href = $($(this).find('a')[0]).attr('href')
        window.location = href
      }
    })
  })

})
