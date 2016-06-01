"use strict";

var edtable = new (function(){
    const SCROLL_HEIGHT = 32;
    var elem = null;

    var table = `
        <div class="edt_wrapper">
            <div class="edt_header">
                <div class="edt_title">{{TITLE}}</div>
                <div class="edt_filter"><input type="text" id="search"><button onclick="javascript:edtable.search()">suchen</button></div>
            </div>
            <div class="edt_thead">
                <table>
                    <colgroup>{{COLGROUP}}</colgroup>
                    <thead>{{HEAD}}</thead>
                </table>
            </div>
            <div class="edt_tbody">
                <table>
                    <colgroup>{{COLGROUP}}</colgroup>
                    <tbody id="edt_table_content"><tr><td>Daten werden geladen...</td></tr></tbody>
                </table>
            </div>
            <div class="edt_tfoot">
                <table>
                    <colgroup>{{COLGROUP}}</colgroup>
                    <tfoot>{{FOOT}}</tfoot>
                </table>
            </div>
            <div class="edt_footer">
                
            </div>
        </div>
    `;

    function generateTableRows(rows,col){
        let result = '';
        let i = 0;
        for(let row of rows){
            i++;
            let dataSearch = '';
            let content = '';
            col.forEach(function(value){
                dataSearch += row[value.field]+";";
                content += '<td>'+row[value.field]+'</td>';
            });
            let css = '';
            if (i>SCROLL_HEIGHT) css = 'hide';
            result += '<tr data-search="'+dataSearch+'" class="'+css+'">'+content+'</tr>';
        }
        return result;
    }

    function generateTableHead(col){
        let str = '<tr>';
        col.forEach(function(value){
            str += '<th>'+value.label+'</th>';
        });
        str += '</tr>';
        return str;
    }



    return {
        init: function(target,data,options){
            elem = target;
            let col = options.col;


            table = table.replace(/\{\{TITLE}}/,options.title);

            table = table.replace(/\{\{HEAD}}/,generateTableHead(col));

            table = table.replace(/\{\{FOOT}}/,"");

            let colgroup = '';
            col.forEach(function(value){
                colgroup += '<col width="'+value.col+'" />';
            });

            table = table.replace(/\{\{COLGROUP}}/g,colgroup);

            target.innerHTML = table;


            var r = new XMLHttpRequest();
            r.open("GET", data, true);
            r.onreadystatechange = function () {
                if (r.readyState != 4 || r.status != 200) return;
                console.log("Daten angekommen");
                document.getElementById("edt_table_content").innerHTML = generateTableRows(JSON.parse(r.responseText),col);

            };
            r.send();

            let scrollDiv = document.getElementsByClassName("edt_tbody");
            scrollDiv[0].addEventListener('scroll', function (e) {
                if ( (e.target.scrollHeight-e.target.offsetHeight-100) < e.target.scrollTop ){
                    edtable.lazyLoad(target);
                }
            })

        },
        search: function(){
            let input = document.getElementById('search');
            let table = document.getElementById("edt_table_content");
            var found = table.querySelectorAll("tr[data-search*='"+input.value+"']");

            showHide(table.childNodes, false);
            showHide(found, true);
        },
        lazyLoad: function(target){

            if (target){

                let hidden = target.querySelector("tr.hide");
                let i = 0;
                while (i < SCROLL_HEIGHT){
                    hidden.className = hidden.className.replace("hide","");
                    hidden = hidden.nextSibling;
                    i++;
                }

            }

        }
    };
    function showHide( elements, show ) {
        var elem, values = [], length = elements.length;

        for (let index = 0; index < length; index++ ) {
            elem = elements[ index ];
            if ( !elem.style ) {
                continue;
            }
            if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
                elem.style.display = show ? values[ index ] || "" : "none";
            }
        }

        return elements;
    }
})();