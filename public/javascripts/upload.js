var fileUploaded = false;
var secondsSet = false;
var g_filename ;

$( document ).ready(function() {
    $("#download-btn").prop( "disabled", true );

    $( window ).unload(function() {
      debugger;
      if( g_filename ){
        //Send an alert to the server to delete the file it was uploaded

        //window.location = `/delete?filename=${g_filename}`;

        // $.ajax({
        //   url: '/delete',
        //   type: 'GET',
        //   async: false,
        //   data: {filename : g_filename},
        //   success: (msg) =>{
        //     console.log(msg);
        //   }
        // });
      }
    });

    $('#seconds-input').on( 'change', function() {
      var s = this.value;
      if( !isNaN(s) && s!=''){
        secondsSet = true;
      }else {
        secondsSet = false;
      }
      changeButtonState();
    } );

    $('.upload-btn').on('click', function (){
        $('#upload-input').click();
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
    });

    $('#download-btn').on('click', function() {
      var sec = $('#seconds-input').val();



      $('#seconds-input').val(null);
      $('.progress-bar').text('0%');
      $('.progress-bar').width('0%');
      fileUploaded = false;
      changeButtonState();

      window.location = `/download?sec=${sec}`;

    });

    $('#upload-input').on('change', function(){

      var files = $(this).get(0).files;

      if (files.length > 0){
        // create a FormData object which will be sent as the data payload in the
        // AJAX request
        var formData = new FormData();

        // loop through all the selected files and add them to the formData object
        for (var i = 0; i < files.length; i++) {
          var file = files[i];

          // add the files to formData object for the data payload
          formData.append('uploads[]', file, file.name);
          debugger;
          g_filename = file.name;
        }

        $.ajax({
          url: '/upload',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(data){
              console.log('upload successful!\n' + data);
              fileUploaded = true;
              changeButtonState();
          },
          xhr: function() {
            // create an XMLHttpRequest
            var xhr = new XMLHttpRequest();

            // listen to the 'progress' event
            xhr.upload.addEventListener('progress', function(evt) {

              if (evt.lengthComputable) {
                // calculate the percentage of upload completed
                var percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);

                // update the Bootstrap progress bar with the new percentage
                $('.progress-bar').text(percentComplete + '%');
                $('.progress-bar').width(percentComplete + '%');

                // once the upload reaches 100%, set the progress bar text to done
                if (percentComplete === 100) {
                  $('.progress-bar').html('Done');
                }

              }

            }, false);

            return xhr;
          }
        });

      }
    });


});


var changeButtonState = () => {
  if(secondsSet && fileUploaded){
    setButtonState('#download-btn', 'btn-disable', 'download-btn', true);
    setButtonState('#upload-btn', 'upload-btn', 'btn-disable', false);
  }else{
    setButtonState('#download-btn', 'download-btn', 'btn-disable', false);
    setButtonState('#upload-btn', 'btn-disable', 'upload-btn', true);

  }
};

var setButtonState = (buttonName, oldButtonClass, newButtonClass, state) => {
  $(buttonName).removeClass(oldButtonClass).addClass(newButtonClass);
  $(buttonName).prop("disabled", !state);
};
