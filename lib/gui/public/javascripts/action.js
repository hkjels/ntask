
$(document).ready(function () {

  $('.filter').click(function (event) {
    event.preventDefault()
    $('#filter').val($('#filter').val()+$(event.target).html()+' ').change()
  })

  $('#filter').change(function (event) {
    $('#search').submit()
  })

})
