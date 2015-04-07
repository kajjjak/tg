var config = {
    "changed": 1427898824037,
    "client": {
        "number": "8958283"
    },
    "database": {
        "host": "http://db01.taxigateway.com/",
        "name": "tgc-e6ed05461250df994aa26e7c2d58b82a"
    },
    "design": {
        "map": {
            "rad_userpositionrange": {
              "name": "User location and range circle",
              "class": "style-page-map-rad_userpositionrange",
              "style": {
                "color": "orange",
                "fillColor": "orange",
                "fillOpacity": 0.2
              }
            },
            "ico_pickupcreate": {
              "name": "Pickup marker icon",
              "selection": "pickup_markers",
              "value": "marker_leaflet_orange"
            },            
            "btn_continue": {
                "class": "style-page-map-btn_continue",
                "name": "Design map button continue",
                "style": {
                    "background-color": "#ECB300",
                    "border-color": "#BEA10E",
                    "border-radius": "5px",
                    "border-style": "solid",
                    "border-width": "1px",
                    "color": "#000",
                    "font-family": "sans-serif",
                    "font-size": "18px",
                    "font-weight": "800"
                }
            },
            "btn_view": {
                "class": "style-page-map-btn_view",
                "name": "Design map button view",
                "style": {
                    "background-color": "#ECB300",
                    "border-color": "#BEA10E",
                    "border-radius": "5px",
                    "border-style": "solid",
                    "border-width": "1px",
                    "color": "#000",
                    "font-family": "sans-serif",
                    "font-size": "18px",
                    "font-weight": "800"
                }
            }
        },
        "request": {
            "btn_cancel": {
                "class": "style-page-request-btn_cancel",
                "name": "Request cancel button",
                "style": {
                    "background-color": "#ECB300",
                    "border-color": "#BEA10E",
                    "border-radius": "5px",
                    "border-style": "solid",
                    "border-width": "1px",
                    "color": "#000",
                    "font-family": "sans-serif",
                    "font-size": "18px",
                    "font-weight": "800"
                }
            },
            "btn_complete": {
                "class": "style-page-request-btn_complete",
                "name": "Request complete button",
                "style": {
                    "background-color": "#ECB300",
                    "border-color": "#BEA10E",
                    "border-radius": "5px",
                    "border-style": "solid",
                    "border-width": "1px",
                    "color": "#000",
                    "font-family": "sans-serif",
                    "font-size": "18px",
                    "font-weight": "800"
                }
            },
            "btn_confirm": {
                "class": "style-page-request-btn_confirm",
                "name": "Request confirmed button",
                "style": {
                    "background-color": "#ECB300",
                    "border-color": "#BEA10E",
                    "border-radius": "5px",
                    "border-style": "solid",
                    "border-width": "1px",
                    "color": "#000",
                    "font-family": "sans-serif",
                    "font-size": "18px",
                    "font-weight": "800"
                }
            }
        },
        "revoke": {
            "btn_call": {
                "class": "style-page-revoke-btn_call",
                "name": "Revoke request button",
                "style": {
                    "background-color": "#ECB300",
                    "border-color": "#BEA10E",
                    "border-radius": "5px",
                    "border-style": "solid",
                    "border-width": "1px",
                    "color": "#000",
                    "font-family": "sans-serif",
                    "font-size": "18px",
                    "font-weight": "800"
                }
            }
        },
        "service": {
            "btn_confirm": {
                "class": "style-page-service-btn_confirm",
                "name": "Service confirm button",
                "style": {
                    "background-color": "#ECB300",
                    "border-color": "#BEA10E",
                    "border-radius": "5px",
                    "border-style": "solid",
                    "border-width": "1px",
                    "color": "#000",
                    "font-family": "sans-serif",
                    "font-size": "18px",
                    "font-weight": "800"
                }
            }
        }
    },
    "internationalization": {
        "en": {
            "id": "en",
            "locale": {
                "datetime": "en-IS"
            },
            "title": "English"
        }
    },
    "language": "en",
    "locale": {
        "datetime": "en-IS"
    },
    "map": {
        "position": [
            64.141819,
            -21.933487
        ],
        "zoom": 16
    },
    "notification": {
        "apnkey_directory": "../pems/",
        "changes_heartbeat": 1000,
        "client_database": "tgc-e6ed05461250df994aa26e7c2d58b82a",
        "gcmkey_serverapi": "852062115167",
        "gcmkey_serverkey": "AIzaSyB8XL-_Bx_UwssTqzpeb8g5K2UluwR-3d4",
        "server_database": "http://db01.taxigateway.com/",
        "server_password": "alicia.123",
        "server_username": "taxigateway"
    },
    "serverapi": {
        "host": "http://taxigateway.com/"
    },
    "service": {
        "defaults": {
            "vehicles": "100"
        },
        "options": {
            "1": {
                "id": 1,
                "summary": "If available a chair will be provided",
                "title": "Baby chair",
                "type": "services"
            }
        },
        "vehicles": {
            "100": {
                "default": true,
                "id": 100,
                "lang": {
                    "en": {
                        "summary": "Regular vehicle",
                        "title": "Regular"
                    }
                },
                "order": 100,
                "summary": "Regular vehicle",
                "title": "Regular",
                "type": "vehicles"
            },
            "200": {
                "default": false,
                "id": 200,
                "lang": {
                    "en": {
                        "summary": "Large vehicle +7",
                        "title": "Large"
                    }
                },
                "order": 200,
                "summary": "Large vehicle +7",
                "title": "Large",
                "type": "vehicles"
            }
        }
    },
    "setup": {
        "driver": {
            "position": false
        }
    },
    "sound": {
        "notification": {
            "accepted": "bingbingbing",
            "arrived": "beepbeep",
            "assigned": "bingbingbing",
            "canceled": "bingbingbing",
            "message": "bingbingbing"
        }
    }
};