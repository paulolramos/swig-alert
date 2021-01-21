(function () {
  // format long dates
  const longDates = document.querySelectorAll('.long-date');
  for (let date of longDates) {
    date.innerHTML = moment(new Date(date.innerHTML)).format(
      'MMMM Do YYYY, h:mma',
    );
    date.classList.remove('hidden');
  }

  // get relative times
  const relativeDates = document.querySelectorAll('.relative-date');
  for (let date of relativeDates) {
    date.innerHTML = moment(new Date(date.innerHTML), 'YYYYMMDD').fromNow();
    date.classList.remove('hidden');
  }
})();
