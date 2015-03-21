#!/usr/bin/env python
# -*- coding: utf-8 -*-

lang_en = {
  "notification": {
    "assigned": {
      "message_notify": "New job receaved",
      "vibrate": 100,
      "title": "Assigned", 
      "message": "Check job list"
    },
    "accepted": {
      "message_notify": "On our way",
      "vibrate": 100,
      "title": "On our way", 
      "message": "We are on our way to pick you up"
    },    
    "arrived": {
      "message_notify": "We have arrived",
      "vibrate": 100,
      "title": "Arrived", 
      "message": "Your driver has arrived"
    },
    "canceled": {
      "message_notify": "Job has been canceled",
      "vibrate": 800,
      "title": "Canceled job", 
      "message": "Review your jobs, a job was canceled"      
    }
  }
}

lang_is = {
  "notification": {
    "assigned": {
      "message_notify": u"Nýtt verkefni",
      "vibrate": 100,
      "title": "Nýtt verkefni", 
      "message": "Skoðið pantanir"
    },    
    "accepted": {
      "message_notify": u"Erum lagðir af stað",
      "vibrate": 100,
      "title": "Á leiðinni", 
      "message": "Erum á leiðinni til þín"
    },
    "arrived": {
      "message_notify": u"Erum kominn",
      "vibrate": 100,
      "title": "Komin", 
      "message": "Er að biða fyrir utan"
    },
    "canceled": {
      "message_notify": u"Hætt var við pöntun",
      "vibrate": 800,
      "title": "Hætt við", 
      "message": "Farið yfir vinnu listinn. Einn viðskiptamaður hætti við"      
    }
  }
}
default_lang = "is";
lang = {"is": lang_is, "en": lang_en}
lang[None] = lang[default_lang]