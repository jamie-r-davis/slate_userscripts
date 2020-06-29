// ==UserScript==
// @name         Remove Duplicate IDs
// @namespace    http://tampermonkey.net/
// @version      0.2
// @updateURL    https://raw.githubusercontent.com/jamie-r-davis/slate_userscripts/master/consolidated_records/remove-duplicate-ids.js
// @description  try to take over the world!
// @author       You
// @match        https://enrollmentconnect.umich.edu/manage/database/dedupe
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    async function GetDuplicates(folder) {
        var url = new URL('https://enrollmentconnect.umich.edu/manage/query/run?id=de498e93-ce6a-4dc3-a2b1-69412acc79c6&h=a919c3f6-8a58-d14a-014c-68cf290fde38&cmd=service&output=json');
        url.searchParams.append('folder', folder);
        console.log(url);
        let duplicates = await fetch(url).then(async function(resp) {let data = await resp.json(); console.log(data); return data.row})
        return duplicates
    }

    async function RemoveDuplicates() {
        var folder = View.folder;
        console.log(`Folder is ${folder}`);
        let duplicates = await GetDuplicates(folder);
        for (var i=0; i<duplicates.length; i++) {
            var duplicate = duplicates[i];
            var el = document.querySelector(`tr#r${duplicate.id}`);
            if (el) {
                el.remove();
            }
        }
    }
    
    function DeleteSiblings() {
        function DeleteSibs(el) {
            let nextElement = el.nextSibling;
            el.parentNode.removeChild(el);
            if (nextElement) {
                DeleteSibs(nextElement)
            };
            return
        }
        let currentElement = document.querySelector('input[type=checkbox]:checked').closest('tr');
        (!currentElement) ? alert('Check the row where you want to begin removing') : DeleteSibs(currentElement);
        UpdateEstimates();
    }

    class View {
        static get folder() {
            let container = document.querySelector('#responsesContainer');
            if (container) {
                return document.querySelector('#responsesContainer input[name="folder"]').value;
            }
            return null;
        }
        static get dataset() {
            let container = document.querySelector('#responsesContainer');
            if (container) {
                return document.querySelector('#responsesContainer input[name="dataset"]').value;
            }
            return null;
        }
        static get scope() {
            let container = document.querySelector('#responsesContainer');
            if (container) {
                let node = document.querySelector('#responsesContainer input[name="scope"]');
                if (node) {
                    return node.value;
                } else {
                    return 'person';
                }
            }
            return null;
        }
    }

    function AddBtn(text, event) {
        let id = text.toLowerCase().replace(/\s+/, '_');
        if (!document.getElementById(id)) {
            let btn = document.createElement('button');
            btn.setAttribute('id', id);
            btn.innerText = text;
            btn.addEventListener('click', event);
            btn.style['margin-right'] = '0.5rem';
            let parent = document.querySelector('#content');
            parent.insertBefore(btn, parent.firstChild);
        }
    }
    
    AddBtn('Remove Rows', DeleteSiblings);
    AddBtn('Remove Dup IDs', RemoveDuplicates);
    
})();
