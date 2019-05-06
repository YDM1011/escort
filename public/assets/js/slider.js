'use strict';
function slider_ini (){

    //01_home hero slider
    $('.hero-slider-wr').slick({
            slidesToShow: 1,
            responsive: [
            {
                    breakpoint: 991,
                    settings: {
                            adaptiveHeight: true,
                    }
            },
            ]
    })

    //recently featured
    $('.recently-featured-slider').slick({
            slidesToShow: 3,
            arrows: false,
            dots: true,
            responsive: [
            {
                    breakpoint: 991,
                    settings: {
                            slidesToShow: 2,
                    }
            },
            {
                    breakpoint: 450,
                    settings: {
                            slidesToShow: 1,
                    }
            }
            ]
    })
    //testimonials
    $('.testimonials-slider').slick({
            slidesToShow: 1,
    })
    //01_Home agancy logo slider
    $(".agancy-logo-wr").slick({
            slidesToShow: 5,
            responsive: [
            {
                    breakpoint: 991,
                    settings: {
                            slidesToShow: 4,
                    }
            },
            {
                    breakpoint: 767,
                    settings: {
                            slidesToShow: 3,
                    }
            },
            {
                    breakpoint: 575,
                    settings: {
                            slidesToShow: 2,
                    }
            }
            ]
    })

    $('.profile-photos-container').slick({
            arrows: false,
            responsive: [
            {
                    breakpoint: 991,
                    settings: {
                            arrows: true,
                    }
            }
            ]
    });
    $('.profile-entry .thumbnail-photo img').on('click', function(){
            var imgIndex = $(this).parent().index();
            $('.profile-photos-container').slick('slickGoTo', imgIndex);
    })

    // 05_Model_Profile
    $('.another-model-slider').slick({

    })
}