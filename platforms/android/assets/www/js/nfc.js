/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
    
        function failure(reason) {
            navigator.notification.alert(reason, function() {}, "There was a problem");
        }

        nfc.addNdefListener(
            app.onNdef,
            function() {
                console.log("Listening for NDEF tags.");
            },
            failure
        );

        if (device.platform == "Android") {

            // Android reads non-NDEF tag. BlackBerry and Windows don't.
            nfc.addTagDiscoveredListener(
                app.onNfc,
                function() {
                    console.log("Listening for non-NDEF tags.");
                },
                failure
            );

            // Android launches the app when tags with mime type text/pg are scanned
            // because of an intent in AndroidManifest.xml.
            // phonegap-nfc fires an ndef-mime event (as opposed to an ndef event)
            // the code reuses the same onNfc handler
            nfc.addMimeTypeListener(
                'text/pg',
                app.onNdef,
                function() {
                    console.log("Listening for NDEF mime tags with type text/pg.");
                },
                failure
            );
        }

        app.compileTemplates();
        app.addTemplateHelpers();
        app.showInstructions();
    },
    onNfc: function (nfcEvent) {
        
        var tag = nfcEvent.tag;
        
        console.log(JSON.stringify(nfcEvent.tag));
        app.clearScreen();

        tagContents.innerHTML = app.nonNdefTagTemplate(tag);    
        navigator.notification.vibrate(100);        
    },
    onNdef: function (nfcEvent) {
        
        console.log(JSON.stringify(nfcEvent.tag));
        app.clearScreen();

        var tag = nfcEvent.tag;

        // BB7 has different names, copy to Android names
        if (tag.serialNumber) {
            tag.id = tag.serialNumber;
            tag.isWritable = !tag.isLocked;
            tag.canMakeReadOnly = tag.isLockable;
        }

        tagContents.innerHTML = app.tagTemplate(tag);

        navigator.notification.vibrate(100);        
    },
    clearScreen: function () {
        
        tagContents.innerHTML = "";
        
    },
    showInstructions: function () {

        var hidden = document.getElementsByClassName('hidden');
        if (hidden && hidden.length) {
            hidden[0].className = 'instructions';
        }
        
    },
    compileTemplates: function () {

        var source;
                    
        source = document.getElementById('non-ndef-template').innerHTML;
        app.nonNdefTagTemplate = Handlebars.compile(source);

        source = document.getElementById('tag-template').innerHTML;
        app.tagTemplate = Handlebars.compile(source);
        
    },
    addTemplateHelpers: function () {
        
        Handlebars.registerHelper('bytesToString', function(byteArray) { 
            return nfc.bytesToString(byteArray);
        });

        Handlebars.registerHelper('bytesToHexString', function(byteArray) {
            return nfc.bytesToHexString(byteArray); 
        });

        // useful for boolean
        Handlebars.registerHelper('toString', function(value) {  
            return String(value);  
        });

        Handlebars.registerHelper('tnfToString', function(tnf) {  
            return tnfToString(tnf);  
        });

        Handlebars.registerHelper('decodePayload', function(record) {
            return decodePayload(record);
        });
        
        Handlebars.registerHelper('pluralize', function(number, single, plural) {
          if (number === 1) { return single; }
          else { return plural; }
        });     
    },
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

    // ideally some form of this can move to phonegap-nfc util
    function decodePayload(record) {
        var recordType = nfc.bytesToString(record.type),
            payload;

        // TODO extract this out to decoders that live in NFC code
        // TODO add a method to ndefRecord so the helper 
        // TODO doesn't need to do this

        if (recordType === "T") {
            var langCodeLength = record.payload[0],
            text = record.payload.slice((1 + langCodeLength), record.payload.length);
            payload = nfc.bytesToString(text);

        } else if (recordType === "U") {
            var identifierCode = record.payload.shift(),
            uri =  nfc.bytesToString(record.payload);

            if (identifierCode !== 0) {
                // TODO decode based on URI Record Type Definition
                console.log("WARNING: uri needs to be decoded");
            }
            //payload = "<a href='" + uri + "'>" + uri + "<\/a>";
            payload = uri;

        } else {

            // kludge assume we can treat as String
            payload = nfc.bytesToString(record.payload); 
        }

        return payload;
    }

    // TODO move to phonegap-nfc util
    function tnfToString(tnf) {
        var value = tnf;
        
        switch (tnf) {
        case ndef.TNF_EMPTY:
            value = "Empty";
            break; 
        case ndef.TNF_WELL_KNOWN:
            value = "Well Known";
            break;     
        case ndef.TNF_MIME_MEDIA:
            value = "Mime Media";
            break;     
        case ndef.TNF_ABSOLUTE_URI:
            value = "Absolute URI";
            break;     
        case ndef.TNF_EXTERNAL_TYPE:
            value = "External";
            break;     
        case ndef.TNF_UNKNOWN:
            value = "Unknown";
            break;     
        case ndef.TNF_UNCHANGED:
            value = "Unchanged";
            break;     
        case ndef.TNF_RESERVED:
            value = "Reserved";
            break;     
        }
        return value;
    }
    // Update DOM on a Received Event
    

app.initialize();