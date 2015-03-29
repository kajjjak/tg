var config = {
    "changed": 1427477389889,
    "client": {
        "number": "+3548958283"
    },
    "database": {
        "host": "http://db01.taxigateway.com/",
        "name": "tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57"
    },
    "design": {
        "map": {
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
                    "background-color": "#000",
                    "border-color": "#BEA10E",
                    "border-radius": "5px",
                    "border-style": "solid",
                    "border-width": "1px",
                    "color": "#FFF",
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
            64.1353379,
            -21.89521
        ],
        "zoom": 16
    },
    "serverapi": {
        "host": "http://taxigateway.com/"
    },
    "service": {
        "defaults": {
            "vehicles": "1427477198229"
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
                "default": false,
                "hidden": false,
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
            "1427477198229": {
                "default": true,
                "hidden": false,
                "id": 1427477198229,
                "lang": {
                    "en": {
                        "summary": "Test",
                        "title": "Test"
                    }
                },
                "order": 300,
                "summary": "Test",
                "title": "Test",
                "type": "vehicles"
            },
            "200": {
                "default": false,
                "hidden": true,
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
            "canceled": "bingbingbing"
        }
    }
};