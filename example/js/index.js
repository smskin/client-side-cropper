/**
 * Created by smskin on 22.12.16.
 */

var Page = function(){

    var ElementWithDataAttributes = function(){

        var $element;

        return {
            init: function(){
                $element = $('#elementWithDataAttributes');
                $element.clientSideCropper();
            }
        }
    }();

    var ElementWithDataAttributesAndCustomModal = function(){

        var $element;

        return {
            init: function(){
                $element = $('#elementWithDataAttributesAndCustomModal');
                $element.clientSideCropper();
            }
        }
    }();

    var ElementWithConfig = function(){

        var $element;

        return {
            init: function(){
                $element = $('#elementWithConfig');
                $element.clientSideCropper({
                    url:'server.php',
                    data:{
                        type:'image3'
                    },
                    cropModalDivId: 'auto',
                    minWidth:400,
                    minHeight:400,
                    previewHeight:200,
                    previewWidth:200,
                    onError: function(reason){
                        alert(reason)
                    },
                    onSuccess: function(serverResponse){
                        console.log(serverResponse)
                    },
                    lockModalDivId: 'lockModal'
                });
            }
        }
    }();

    return {
        init: function(){
            ElementWithDataAttributes.init();
            ElementWithDataAttributesAndCustomModal.init();
            ElementWithConfig.init();
        }
    }
}();

(function($){

    $(document).ready(function(){
        Page.init();
    })

})(jQuery);
