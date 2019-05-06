'use strict';
$(window).on('load', function () {
    
    //menu toggle
    var navigation_wr = $('.navigation-wr')
    var lang_menu = $('.lang-menu')
    var search = $('#search');
    
    $('.fa-bars').on('click', function(){
            navigation_wr.addClass('active');
    })
    $('.fa-times').on('click', function(){
            navigation_wr.removeClass('active');		
    })
    $('.lang-toggle').on('click', function(){
            lang_menu.toggleClass('active');
    })
    $(window).on('click', function(e){
            if(!$(e.target).closest('.lang-menu').length && !$(e.target).closest('.lang-toggle').length){
                    lang_menu.removeClass('active');
            }
    })
    //sub-menu
    $('.menu-item-has-children > a').on('click', function(e){
            e.preventDefault();
            $(this).next().toggleClass('active').next().toggleClass('active');
    })

    //search in header
    
    $('.search-wr .icon').on('click', function(){
            if(search.hasClass('active') && search.val() != ""){
                    $('.search-wr .submit').trigger('click');
            } else {
                    search.addClass('active').focus();
            }
    })
    search.on('focusout', function(){
            if($(window).width() > 991){
                    if($(this).val() == ""){
                            search.removeClass('active');
                    }
            }
    })

            //search in widget
            $('#widget-search-form .ion-ios-search').on('click', function(){
                    $('#widget-search-form').trigger('submit');
            })

            function addActiveToSearch(){
                    if($(window).width() < 991){
                            search.addClass('active').focus();
                    } else {
                            if(search.val() == ""){
                                    removeActiveFromSearch();
                            }
                    }
            }
            addActiveToSearch()

            function removeActiveFromSearch(){
                    search.removeClass('active').focus();
            }

            //hide sub-menu when window size more than 991px
            $(window).on('resize', function(){
                    addActiveToSearch();
                    if($(this).width() > 991){
                            $('.sub-menu-toggle, .sub-menu').removeClass('active');
                            navigation_wr.removeClass('active');
                    } else {
                            search.blur();
                    }
            })


            //forms
            $('.form').on('submit', function(e){
                    e.preventDefault();
                    var message = $('.form-message');
                    var messageError = $('.form-message.error');
                    var messageSaccess = $('.form-message.saccess');
                    if($(this).find('.name').val() == '' || $(this).find('.email').val() == ''){
                            message.hide();
                            messageError.show();

                    } else {
                            message.hide();
                            messageSaccess.show();

                            $('.form')[0].reset();
                    }
            })

            //model rating
            var rate_star = $('.rate-model .fa-star');
            rate_star.on('click', function(){

                    //reset checked rating value
                    var input = $('#rating-value input');
                    input.attr( 'checked', false );

                    //add checked attribute to rating value
                    var elementIndex = $(this).index();
                    input.eq(elementIndex).attr( 'checked', true );

                    //make stars choosen
                    rate_star.removeClass('active chosen');
                    $(this).addClass('active chosen').prevAll().addClass('active chosen');
            })
            
            
            rate_star.on({
                'mouseenter': function () {
                    rate_star.removeClass('active');
                    $(this).addClass('active').prevAll().addClass('active');
                },
                'mouseleave': function () {
                    rate_star.removeClass('active');
                    $(this).addClass('active').prevAll().addClass('active');
                }
            });
            
            
            $('.rating').on('mouseleave', function(){
                    rate_star.removeClass('active');
            })

            //accardion
            $('.accordion-item .title').on('click', function(){
                    $(this).toggleClass('active').next().slideToggle();
            })

            //filters
            $('.filter-label').on('click', function(){
                    $('#filter-models').slideToggle();
            })

            //sign-in/up tabs
            $('.sign-header .tab').on('click', function(){
                    $('.sign-header .tab').removeClass('active');
                    $(this).addClass('active');
                    var dataForm = '.' + $(this).data('form');
                    $('.sign-form-inner').find('.form-wr').removeClass('active').filter(dataForm).addClass('active');
            })

            //svg map tooltip
            var tooltip = $('.tooltip');
            $('svg .land').on('mousemove', function(e){
                    var left = e.pageX;
                    var top = e.pageY - 60 - $(window).scrollTop();
                    var stateName = $(this).data('title');
                    tooltip.css({'left' : left, 'top': top}).text(stateName).show();
                    $('svg').on('mouseout', function(){
                            tooltip.hide();
                    })
            })

            if(typeof  $.fn.selectpicker =='function')
                $('.selectpicker').selectpicker({
                    style: 'selectpicker-primary',
                });
                
        if(typeof map_ini === 'function'){
            map_ini();
        }
                
        if(typeof slider_ini === 'function'){
            slider_ini();
        }
    
                    
    });
    
