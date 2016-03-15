$(function() {
    $('#fileupload').fileupload({
        url:"http://localhost:8080/acmrexcel/excel.htm?m=upload",
        dataType:'json',
        singleFileUploads:false,
        maxFileSize: 999000,
        done: function(e, data) {
            if(data.returncode===200){
                $('.progress .progress-bar').css('width', '100%');
            }
        },
        success: function(data) {
            if(data.returncode===200){
                $('.progress .progress-bar').css('width', '100%');
                window.location = "http://localhost:8080/acmrexcel/excel.htm?m=uploadComplete&excelId="+data.returndata;
            }
        },
        progressall: function(e, data) {
            var progress = parseInt(data.loaded / data.total * 70, 10);
            $('.progress .progress-bar').css(
                'width',
                progress + '%'
            );
        },

    });
});