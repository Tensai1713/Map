$(document).ready(function() {
  // Запрет на ввод пробелов в полях
  $("input[name='stateNumber'], input[name='stateNumberSearch']").on('input', function() {
      this.value = this.value.replace(/\s/g, ''); // Удаляем пробелы из значения полей
  });

  $("input[name='entryDate'], input[name='outDate'], input[data-field='entry_date'], input[data-field='out_date']").on('input', function() {
    const input = this;
    const value = input.value;

    // Регулярное выражение для проверки формата даты (YYYY-MM-DD)
    const dateParts = value.split('-');
    if (dateParts[0] && dateParts[0].length > 4) {
        dateParts[0] = dateParts[0].slice(0, 4); // Ограничиваем только год до 4 цифр
    }
    // Объединяем дату обратно
    input.value = dateParts.join('-'); 
});


$("#carForm").submit(function(event) {
    event.preventDefault(); // Избегаем обычной отправки формы

    const carMake = $("input[name='carMake']").val().trim();
    const stateNumber = $("input[name='stateNumber']").val().trim();
    const driverLastName = $("input[name='driverLastName']").val().trim();
    const fullNameApplicant = $("input[name='fullNameApplicant']").val().trim();
    const entryDate = $("#entryDate").val();
    const outDate = $("#outDate").val();
    const comment = $("textarea[name='comment']").val().trim();
    const inspection = $("input[name='inspection']").is(':checked') ? 1 : 0;
    const yearRecord = $("input[name='yearRecord']").is(':checked') ? 1 : 0; // Значение чекбокса

    // Проверка: если все поля пустые
    if (!carMake && !stateNumber && !driverLastName && !fullNameApplicant &&
        !entryDate && !outDate && !comment) {
        Swal.fire({
            text: "Пожалуйста, заполните хотя бы одно поле!",
            icon: "warning",
            showConfirmButton: false,
            timer: 2000,
            backdrop: false // Отключаем затемнение фона
        });
        return; // Прерываем дальнейшее выполнение функции
    }

    $.ajax({
        type: "POST",
        url: "record.php",
        data: $(this).serialize(), // Добавляем годовую запись
        success: function(response) {
            Swal.fire({
                text: response,
                icon: "success",
                showConfirmButton: false,
                timer: 2000,
                backdrop: false // Отключаем затемнение фона
            });
            if (!yearRecord) {
                $("#carForm")[0].reset(); // Сбрасываем форму только если yearRecord не отмечен
            }
            loadLastRecords(); // Обновляем таблицу

      
        },
        error: function() {
            Swal.fire({
                text: "Произошла ошибка при отправке данных. 🥺",
                icon: "error",
                showConfirmButton: false,
                timer: 2000,
                backdrop: false // Отключаем затемнение фона
            });
        }
    });
});

  // Обработка удаления записи
  $(document).on('click', '.delete-btn', function() {
      const button = $(this);
      const id = button.data('id');

      Swal.fire({
          text: "Вы уверены, что хотите удалить эту запись!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Подтвердить',
          cancelButtonText: 'Отмена'
      }).then((result) => {
          if (result.isConfirmed) {
              $.ajax({
                  type: "POST",
                  url: "delete_record.php",
                  data: { id: id },
                  success: function(response) {
                      Swal.fire({
                          text: response,
                          icon: "success",
                          showConfirmButton: false,
                          timer: 2000
                      });
                      button.closest('tr').remove();
                      loadLastRecords(); // Обновляем таблицу
                  },
                  error: function() {
                      Swal.fire({
                          text: "Произошла ошибка при удалении записи. 🥺",
                          icon: "error",
                          showConfirmButton: false,
                          timer: 2000,
                          backdrop: false // Отключаем затемнение фона
                      });
                  }
              });
          }
      });
  });

  // Обработчик для кнопки поиска
  $("#searchBtn").click(function() {
      $('.search').removeClass('none'); // Отображаем панель поиска
      $('.choice').addClass('none'); // Скрываем основную панель
      $('.new-entry__btn-back').removeClass('none');
      $('.logo').addClass('none');
      loadAllRecords(); 
  });

  // Функция для загрузки всех записей
  function loadAllRecords() {
      $.ajax({
          type: "GET",
          url: "get_all_records.php", // Убедитесь, что этот путь правильный
          success: function(response) {
              $("#results").html(response); // Заполняем блок results данными
              updateAllRowColors(); // Обновляем цвета строк
          },
          error: function() {
              Swal.fire({
                  text: "Ошибка при получении записей. 🥺",
                  icon: "error",
                  showConfirmButton: false,
                  timer: 2000,
                  backdrop: false // Отключаем затемнение фона
              });
          }
      });
  }

  // Обработка формы поиска
  $("#carForm2").submit(function(event) {
      event.preventDefault(); // Избегаем обычной отправки формы

      $.ajax({
          type: "POST",
          url: "display_coincidences.php", // Убедитесь, что этот путь правильный
          data: $(this).serialize(),
          success: function(response) {
              $("#results").html(response); // Вставляем полученные данные в блок results
              updateAllRowColors(); // Обновляем цвета строк на основании значения inspection
          },
          error: function() {
              Swal.fire({
                  text: "Произошла ошибка при выполнении поиска. 🥺",
                  icon: "error",
                  showConfirmButton: false,
                  timer: 2000,
                  backdrop: false // Отключаем затемнение фона
              });
          }
      });
  });

  // Обработчики событий для переключения панелей
  const newEntryPanel = document.querySelector('.new-entry');
  const newEntryBtn = document.querySelector('#entryBtn');
  const choicePanel = document.querySelector('.choice');
  const newEntryBtnBack = document.querySelector('#newEntryBtnBack');
  const search = document.querySelector('.search');
  const resultsContainer = document.querySelector('#results');
  const logo = document.querySelector('.logo');

  newEntryBtn.addEventListener('click', () => {
      newEntryPanel.classList.remove('none');
      choicePanel.classList.add('none');
      newEntryBtnBack.classList.remove('none');
      logo.classList.add('none');
      loadLastRecords(); // Загружаем последние записи
  });

  newEntryBtnBack.addEventListener('click', () => {
      newEntryPanel.classList.add('none');
      choicePanel.classList.remove('none');
      newEntryBtnBack.classList.add('none');
      search.classList.add('none');
      logo.classList.remove('none');
      resultsContainer.innerHTML = ''; // Очищаем результаты
  });

  // Обработчик клика на кнопку редактирования
  $(document).on('click', '.edit-btn', function() {
      const row = $(this).closest('tr');
      row.addClass('highlight'); 
      row.find('.edit-field').prop('disabled', false);
      $(this).hide();
      row.find('.save-btn').show();
  });

  $(document).on('click', '.save-btn', async function() {
      const row = $(this).closest('tr');
      row.removeClass('highlight'); 
      const id = row.data('id');

      const yearRecord = row.find('input[data-field="year_record"]').is(':checked') ? 1 : 0;

      const data = {
          id: id,
          car_make: row.find('input[data-field="car_make"]').val().trim(),
          state_number: row.find('input[data-field="state_number"]').val().trim(),
          driver_last_name: row.find('input[data-field="driver_last_name"]').val().trim(),
          full_name_applicant: row.find('input[data-field="full_name_applicant"]').val().trim(),
          entry_time: row.find('input[data-field="entry_time"]').val(),
          out_time: row.find('input[data-field="out_time"]').val(),
          entry_date: row.find('input[data-field="entry_date"]').val(),
          out_date: row.find('input[data-field="out_date"]').val(),
          comment: row.find('textarea[data-field="comment"]').val().trim(),
          inspection: row.find('input[data-field="inspection"]').is(':checked') ? 1 : 0,
          year_record: yearRecord
      };

      // Проверки на пустые поля
      if (!data.car_make && !data.state_number && !data.driver_last_name && 
          !data.full_name_applicant && !data.comment && !data.entry_date && !data.out_date) {
          Swal.fire({
              text: "Пожалуйста, заполните хотя бы одно поле!",
              icon: "warning",
              showConfirmButton: false,
              timer: 2000,
              backdrop: false // Отключаем затемнение фона
          });
          return; 
      }

      // Валидация даты
      const entryYear = data.entry_date.split('-')[0]; 
      const outYear = data.out_date.split('-')[0];

      if (entryYear.length > 4 || outYear.length > 4) {
          Swal.fire({
              text: "Введите корректную дату.",
              icon: "error",
              showConfirmButton: false,
              timer: 2000,
              backdrop: false // Отключаем затемнение фона
          });
          return; 
      }

      try {
          const response = await $.ajax({
              type: "POST",
              url: "update_record.php",
              data: data
          });
          Swal.fire({
              text: "Данные успешно обновлены!",
              icon: "success",
              showConfirmButton: false,
              timer: 2000,
              backdrop: false // Отключаем затемнение фона
          });

          // Обновляем цвет строки
          updateRowColors(row, data.inspection);

          row.find('.edit-field').prop('disabled', true);
          row.find('.edit-btn').show();
          row.find('.save-btn').hide();
      } catch (error) {
          console.error("Ошибка при запросе: ", error);
          Swal.fire({
              text: "Ошибка при обновлении данных. 🥺",
              icon: "error",
              showConfirmButton: false,
              timer: 2000,
              backdrop: false // Отключаем затемнение фона
          });
      }
  });

  // Функция для обновления цвета строки
  function updateRowColors(row, inspection) {
      if (inspection == 1) {
          row.css('background-color', 'rgb(218, 215, 91)'); // Цвет для "Без досмотра" активен
      } else {
          row.css('background-color', ''); // Сбрасываем цвет
      }
  }

  // Функция для обновления цветов строк
  function updateAllRowColors() {
      $('#results tr').each(function() {
          const inspection = $(this).find('input[data-field="inspection"]').is(':checked');
          if (inspection) {
              $(this).css('background-color', 'rgb(218, 215, 91)'); // Устанавливаем жёлтый для "Без досмотра"
          } else {
              $(this).css('background-color', ''); // Сбрасываем цвет
          }
      });
  }

  // Функция для загрузки последних записей
  function loadLastRecords() {
      $.ajax({
          type: "GET",
          url: "get_last_records.php", // Убедитесь, что файл доступен
          success: function(response) {
              $("#results").html(response); // Вставляем полученные данные в блок results
          },
          error: function() {
              Swal.fire({
                  text: "Ошибка при получении записей. 🥺",
                  icon: "error",
                  showConfirmButton: false,
                  timer: 2000,
                  backdrop: false // Отключаем затемнение фона
              });
          }
      });
  }
});
