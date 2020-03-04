import $ from 'jquery';
import { loadEvents } from './scripts/mongo';
import flatpickr from "flatpickr";
import { Latvian } from "flatpickr/dist/l10n/lv.js"
import "mark.js/dist/jquery.mark.es6";
const Handlebars = require("handlebars");
const moment = require('moment');

moment.locale('lv');


import './styles/style.scss';

const loadInProgress = false;

async function showEvents() {

    let source = document.getElementById("eventTemplate").innerHTML;
    let template = Handlebars.compile(source);


    $(".loading").show();

    let params = {};

    params.skip = $("#eventResults .event-item").length;
    params.match = {};


    if ($("#searchRange").val().length > 3) {
        let date = $("#searchRange").val().split(" līdz ");
        params.match.true_date = { $gt: new Date(date[0]), $lt: new Date(date[1]) };
    }

    if ($("#searchTerm").val().length > 3) {
        params.match.title = { $regex: new RegExp($("#searchTerm").val()) };
    }

    let types = [];

    $('.form-check-category:checked').each(function () {
        types.push($(this).attr('value'));
    });

    if (types.length) {
        params.match.type = {
            $in: types
        }
    }

    loadEvents(params).then((results) => {

        if (results.length > 0) {
            $(results).each(function (key, event) {

                if(event.lead_image) {
                    event.lead_image = event.lead_image.replace("http://", "//");
                }

                let context = {
                    title: event.title,
                    type: event.type,
                    image: event.lead_image,
                    date: moment(event.true_date).format("Do MMMM")
                };
                let html = template(context);

                $(html).appendTo("#eventResults")

            });

            $("#eventResults").mark($("#searchTerm").val());
            $("#loadMore").show();

        }
        else {
            $(".no-results-template .no-results-meessage").clone().appendTo("#eventResults");
            $("#loadMore").hide();
        }

        $(".loading").hide();

    });

}

async function ready() {

    // a.k.a. document ready


    // check / uncheck all checkboxes

    $('#selectAll').on('change', function () {
        if (this.checked) {
            $('.form-check-category').each(function () {
                this.checked = true;
            });
        } else {
            this.checked = true;
        }
    });

    $('.form-check-category').on('change', function () {
        if ($('.form-check-category:checked').length == $('.form-check-category').length) {
            $('#selectAll').prop('checked', true);
        } else {
            if ($('.form-check-category:checked').length == 0) {
                $('#selectAll').prop('checked', true);
                $('.form-check-category').prop('checked', true);
            } else {
                $('#selectAll').prop('checked', false);
            }
        }
    });

    // resetting search results when input params change

    const resetResults = function () {

        $("#eventResults").html('');
        showEvents();
    }

    // trigger to call reset if types change

    $('.form-check-category').on('change', function () {
        resetResults();
    });

    // trigger to call reset if search term (with delay for better feel)

    const delay = function (callback, ms) {
        var timer = 0;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }

    $('#searchTerm').keyup(delay(function (e) {
        resetResults();
    }, 500));

    // datepicker config

    flatpickr("#searchRange", {
        locale: Latvian,
        mode: "range",
        altInput: true,
        altFormat: "d.m.Y.",
        dateFormat: "Y-m-d",
        onClose: function () {
            resetResults();
        }
    });

    $("#loadMore").click(function () {
        showEvents();
    });

    showEvents();
}

ready();
