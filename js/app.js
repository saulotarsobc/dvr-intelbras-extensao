define(function (require, exports, module) {
    var e = require("jquery");
    require("ui.core"),
        require("ui.widget"),
        require("ui.tabs"),
        require("ui.slider"),
        require("ui.jquery");
    var t, a = require("common"), n = require("translator"), i = require("service"), o = require("isapi/device"), r = require("utils"), s = require("isapi/response"), l = require("common/plugin"), c = require("common/tool");
    module.exports = {
        init: function (d, u) {
            angular.module("ptzApp", ["ui.jquery"]).service("service", function () {
                var t = this;
                this.m_oLan = n.oLastLanguage,
                    this.m_oScope = null,
                    this.iFisheyeInterval = 0,
                    this.m_oParams = {
                        iSpeed: 4,
                        iPresetIndex: 0,
                        iPatrolIndex: 0,
                        iPatrolPresetIndex: -1,
                        iPatternIndex: 0,
                        bAuto: !1,
                        bPatrolEdit: !1,
                        aPatrolPreset: [],
                        b3DZoom: !1
                    },
                    this.m_oPtzCap = {
                        iPresetNum: 255,
                        iPatrolNum: 4,
                        iPatternNum: 1,
                        bSupportPatrols: o.m_oDeviceCapa.bSupportPatrols,
                        bSupportPattern: !1,
                        aPresetList: [],
                        aPatrolList: [],
                        aPatternList: [],
                        bLight: !1,
                        bWiper: !1,
                        bAuxFocus: !0,
                        bLensInit: !1,
                        bMenu: !0,
                        bManualTack: !1,
                        b3DZoom: !0
                    },
                    this.isCondition = function () {
                        var e = i.m_aWndList[i.m_iWndIndex].bPlay;
                        return e
                    }
                    ,
                    this.getPtzCap = function () {
                        void 0 !== i.m_aChannelList[0] && (WebSDK.WSDK_GetDeviceConfig(a.m_szHostName, "patrolCap", {
                            channel: i.m_aChannelList[0].iId
                        }, {
                            async: !1,
                            success: function (a, n) {
                                t.m_oPtzCap.iPatrolNum = e(n).find("PTZPatrol").length
                            }
                        }),
                            WebSDK.WSDK_GetDeviceConfig(a.m_szHostName, "patternInfo", {
                                channel: 1
                            }, {
                                async: !1,
                                success: function () {
                                    t.m_oPtzCap.bSupportPattern = !0
                                }
                            }))
                    }
                    ,
                    this.stopAuto = function () {
                        i.m_aWndList[i.m_iWndIndex].bAutoPan && (t.iFisheyeInterval && clearInterval(t.iFisheyeInterval),
                            WebSDK.WSDK_PTZControl(a.m_szHostName, i.m_aWndList[i.m_iWndIndex].iChannelId, 15, 0, !1, {
                                async: !1,
                                success: function () {
                                    i.m_aWndList[i.m_iWndIndex].bAutoPan = !1,
                                        t.m_oParams.bAuto = !1
                                },
                                error: function (e, t, a) {
                                    s.saveState(a)
                                }
                            }))
                    }
                    ,
                    this.ptzControl = function (e, n) {
                        var o = t.isCondition();
                        if (o) {
                            var r = i.m_aWndList[i.m_iWndIndex];
                            if (r.bPlay) {
                                var l = r.iChannelPlayIndex;
                                if (l > -1 && "littleEagleEye" === i.m_aChannelList[l].szAttr)
                                    return 15 !== e && (t.iFisheyeInterval && (clearInterval(t.iFisheyeInterval),
                                        t.iFisheyeInterval = 0),
                                        i.m_aWndList[i.m_iWndIndex].bAutoPan = !1,
                                        t.m_oParams.bAuto = !1),
                                        t.eagleEyePTZControl(e, n),
                                        void 0;
                                15 === e ? r.bAutoPan && (n = 0) : t.stopAuto(),
                                    WebSDK.WSDK_PTZControl(a.m_szHostName, i.m_aWndList[i.m_iWndIndex].iChannelId, e, n, !1, {
                                        async: !1,
                                        success: function () {
                                            15 === e && (i.m_aWndList[i.m_iWndIndex].bAutoPan = !r.bAutoPan,
                                                t.m_oParams.bAuto = r.bAutoPan)
                                        },
                                        error: function (e, t, a) {
                                            s.saveState(a)
                                        }
                                    })
                            }
                        }
                    }
                    ,
                    this.eagleEyePTZControl = function (e, a) {
                        0 > e || e > 11 && 15 != e || (0 == a ? t.iFisheyeInterval && (clearInterval(t.iFisheyeInterval),
                            t.iFisheyeInterval = 0) : (clearInterval(t.iFisheyeInterval),
                                t.iFisheyeInterval = setInterval(function () {
                                    l.eagleEyePTZControl(e, a)
                                }, 30)),
                            15 == e && (i.m_aWndList[i.m_iWndIndex].bAutoPan = !i.m_aWndList[i.m_iWndIndex].bAutoPan,
                                t.m_oParams.bAuto = !t.m_oParams.bAuto,
                                t.m_oParams.bAuto || t.iFisheyeInterval && (clearInterval(t.iFisheyeInterval),
                                    t.iFisheyeInterval = 0)))
                    }
                    ,
                    this.set3DZoom = function () {
                        var e = t.isCondition();
                        if (e && t.m_oPtzCap.b3DZoom) {
                            var a = i.m_iWndIndex
                                , n = i.m_aWndList[a];
                            n.b3DZoom ? 0 === l.disableEzoom(a) && (n.b3DZoom = !1,
                                t.m_oParams.b3DZoom = !1) : (i.mutexFunctionProcess(l, t.m_oParams),
                                    0 === l.enableEzoom(a, 1) && (n.b3DZoom = !0,
                                        t.m_oParams.b3DZoom = !0)),
                                c.update()
                        }
                    }
                    ,
                    this.gotoPreset = function (e) {
                        var n = t.isCondition();
                        n && (t.stopAuto(),
                            WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "goPreset", {
                                channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                                preset: e
                            }, {
                                processData: !1,
                                data: null,
                                success: function () { },
                                error: function (e, t, a) {
                                    s.saveState(a)
                                }
                            }))
                    }
                    ,
                    this.setPreset = function (e) {
                        var n = t.isCondition();
                        if (n) {
                            var o = "<?xml version='1.0' encoding='UTF-8'?><PTZPreset version='1.0' xmlns='urn:psialliance-org'><id>" + e + "</id><presetName>Camera" + i.m_aWndList[i.m_iWndIndex].iChannelId + "Preset" + e + "</presetName>" + "</PTZPreset>"
                                , l = r.parseXmlFromStr(o);
                            WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "setPreset", {
                                channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                                preset: e
                            }, {
                                processData: !1,
                                data: l,
                                success: function () { },
                                error: function (e, t, a) {
                                    s.saveState(a)
                                }
                            })
                        }
                    }
                    ,
                    this.startPatrol = function (e) {
                        var n = t.isCondition();
                        n && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "patrolStart", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                            patrol: e
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.stopPatrol = function (e) {
                        var n = t.isCondition();
                        n && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "patrolStop", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                            patrol: e
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.deletePatrol = function (e) {
                        var n = t.isCondition();
                        n && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "deletePatrol", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                            patrol: e
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function (e, t, a) {
                                s.saveState(a, "", 1)
                            },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.getPatrolInfo = function (n, i) {
                        WebSDK.WSDK_GetDeviceConfig(a.m_szHostName, "patrolInfo", {
                            channel: n,
                            patrol: i
                        }, {
                            success: function (a, n) {
                                t.m_oParams.aPatrolPreset.length = 0,
                                    e(n).find("PatrolSequence").each(function () {
                                        "0" !== r.nodeValue(e(this), "presetID") && t.m_oParams.aPatrolPreset.push({
                                            szPresetId: r.nodeValue(e(this), "presetID"),
                                            szTime: parseInt(r.nodeValue(e(this), "delay"), 10) >= 1e3 ? parseInt(r.nodeValue(e(this), "delay"), 10) / 1e3 : parseInt(r.nodeValue(e(this), "delay"), 10),
                                            szSpeed: r.nodeValue(e(this), "seqSpeed")
                                        })
                                    }),
                                    t.m_oParams.bPatrolEdit = !t.m_oParams.bPatrolEdit,
                                    t.m_oScope.$$phase || t.m_oScope.$apply()
                            },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.editPatrol = function (e) {
                        var a = i.m_aWndList[i.m_iWndIndex].iChannelId;
                        0 > a || void 0 === a || t.getPatrolInfo(a, e)
                    }
                    ,
                    this.confirmPatrol = function () {
                        var e = t.m_oParams.iPatrolIndex + 1;
                        if (!(1 > e)) {
                            for (var n = "<?xml version='1.0' encoding='UTF-8'?><PTZPatrol><id>" + e + "</id>" + "<patrolName>patrol " + e + "</patrolName><PatrolSequenceList>", o = 0; t.m_oParams.aPatrolPreset.length > o; o++)
                                n += "<PatrolSequence><presetID>" + t.m_oParams.aPatrolPreset[o].szPresetId + "</presetID>" + "<seqSpeed>" + t.m_oParams.aPatrolPreset[o].szSpeed + "</seqSpeed>" + "<delay>" + 1e3 * parseInt(t.m_oParams.aPatrolPreset[o].szTime, 10) + "</delay></PatrolSequence>";
                            n += "</PatrolSequenceList></PTZPatrol>";
                            var l = r.parseXmlFromStr(n);
                            WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "patrolInfo", {
                                channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                                patrol: e
                            }, {
                                processData: !1,
                                data: l,
                                success: function () {
                                    t.m_oParams.bPatrolEdit = !1,
                                        t.m_oScope.$$phase || t.m_oScope.$apply()
                                },
                                error: function (e, t, a) {
                                    s.saveState(a)
                                }
                            })
                        }
                    }
                    ,
                    this.cancelPatrol = function () {
                        t.m_oParams.bPatrolEdit = !1
                    }
                    ,
                    this.selectPatrolPreset = function (e) {
                        t.m_oParams.iPatrolPresetIndex = e
                    }
                    ,
                    this.addPatrolPreset = function () {
                        var e = t.m_oParams.aPatrolPreset.length;
                        32 > e && t.m_oParams.aPatrolPreset.splice(e, 0, {
                            szPresetId: "1",
                            szTime: "1",
                            szSpeed: "5"
                        })
                    }
                    ,
                    this.deletePatrolPreset = function () {
                        var e = t.m_oParams.aPatrolPreset.length;
                        e > 0 && t.m_oParams.aPatrolPreset.splice(t.m_oParams.iPatrolPresetIndex, 1)
                    }
                    ,
                    this.upPatrolPreset = function () {
                        var e = t.m_oParams.aPatrolPreset.length;
                        if (e > 1 && t.m_oParams.iPatrolPresetIndex > 0) {
                            var a = t.m_oParams.aPatrolPreset[t.m_oParams.iPatrolPresetIndex];
                            t.m_oParams.aPatrolPreset[t.m_oParams.iPatrolPresetIndex] = t.m_oParams.aPatrolPreset[t.m_oParams.iPatrolPresetIndex - 1],
                                t.m_oParams.aPatrolPreset[t.m_oParams.iPatrolPresetIndex - 1] = a
                        }
                    }
                    ,
                    this.downPatrolPreset = function () {
                        var e = t.m_oParams.aPatrolPreset.length;
                        if (e > 1 && e - 1 > t.m_oParams.iPatrolPresetIndex && -1 !== t.m_oParams.iPatrolPresetIndex) {
                            var a = t.m_oParams.aPatrolPreset[t.m_oParams.iPatrolPresetIndex];
                            t.m_oParams.aPatrolPreset[t.m_oParams.iPatrolPresetIndex] = t.m_oParams.aPatrolPreset[t.m_oParams.iPatrolPresetIndex + 1],
                                t.m_oParams.aPatrolPreset[t.m_oParams.iPatrolPresetIndex + 1] = a
                        }
                    }
                    ,
                    this.startPattern = function (e) {
                        var n = t.isCondition();
                        n && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "patternStart", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                            pattern: e
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.stopPattern = function (e) {
                        var n = t.isCondition();
                        n && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "patternStop", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                            pattern: e
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.startRecord = function (e) {
                        var n = t.isCondition();
                        n && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "patternRecordStart", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                            pattern: e
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.stopRecord = function (e) {
                        var n = t.isCondition();
                        n && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "patternRecordStop", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                            pattern: e
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.deletePattern = function (e) {
                        var n = t.isCondition();
                        n && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "deletePattern", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId,
                            pattern: e
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.setMenu = function () {
                        var e = t.isCondition();
                        e && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "setMenu", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.setKeyFocus = function () {
                        var e = t.isCondition();
                        e && WebSDK.WSDK_SetDeviceConfig(a.m_szHostName, "oneKeyFocus", {
                            channel: i.m_aWndList[i.m_iWndIndex].iChannelId
                        }, {
                            async: !1,
                            processData: !1,
                            data: null,
                            success: function () { },
                            error: function (e, t, a) {
                                s.saveState(a)
                            }
                        })
                    }
                    ,
                    this.initParams = function () {
                        t.getPtzCap();
                        for (var e = n.getValue("preset"), a = 0; t.m_oPtzCap.iPresetNum > a; a++)
                            t.m_oPtzCap.aPresetList.push({
                                szId: "" + (a + 1),
                                name: e + ("" + (a + 1))
                            });
                        for (var i = n.getValue("patrolPath"), a = 0; t.m_oPtzCap.iPatrolNum > a; a++)
                            t.m_oPtzCap.aPatrolList.push({
                                szId: "" + (a + 1),
                                name: i + ("" + (a + 1))
                            });
                        for (var o = n.getValue("pattern"), a = 0; t.m_oPtzCap.iPatternNum > a; a++)
                            t.m_oPtzCap.aPatternList.push({
                                szId: "" + (a + 1),
                                name: o + ("" + (a + 1))
                            })
                    }
                    ,
                    this.updatePatrol = function () {
                        if (0 >= t.m_oPtzCap.iPatrolNum && i.m_aWndList[i.m_iWndIndex].iChannelId > 0) {
                            WebSDK.WSDK_GetDeviceConfig(a.m_szHostName, "patrolCap", {
                                channel: i.m_aWndList[i.m_iWndIndex].iChannelId
                            }, {
                                async: !1,
                                success: function (a, n) {
                                    t.m_oPtzCap.iPatrolNum = e(n).find("PTZPatrol").length
                                }
                            });
                            for (var o = n.getValue("patrolPath"), r = 0; t.m_oPtzCap.iPatrolNum > r; r++)
                                t.m_oPtzCap.aPatrolList.push({
                                    szId: "" + (r + 1),
                                    name: o + ("" + (r + 1))
                                })
                        }
                    }
            }).controller("ptzController", ["$scope", "service", function ($scope, service) {
                t = $scope,
                    $scope.oLan = service.m_oLan,
                    service.m_oScope = $scope,
                    $scope.oParams = service.m_oParams,
                    $scope.oPtzCap = service.m_oPtzCap,
                    $scope.ptzControl = service.ptzControl,
                    $scope.gotoPreset = service.gotoPreset,
                    $scope.setPreset = service.setPreset,
                    $scope.startPatrol = service.startPatrol,
                    $scope.stopPatrol = service.stopPatrol,
                    $scope.editPatrol = service.editPatrol,
                    $scope.deletePatrol = service.deletePatrol,
                    $scope.startPattern = service.startPattern,
                    $scope.stopPattern = service.stopPattern,
                    $scope.startRecord = service.startRecord,
                    $scope.stopRecord = service.stopRecord,
                    $scope.deletePattern = service.deletePattern,
                    $scope.cancelPatrol = service.cancelPatrol,
                    $scope.confirmPatrol = service.confirmPatrol,
                    $scope.selectPatrolPreset = service.selectPatrolPreset,
                    $scope.addPatrolPreset = service.addPatrolPreset,
                    $scope.deletePatrolPreset = service.deletePatrolPreset,
                    $scope.upPatrolPreset = service.upPatrolPreset,
                    $scope.downPatrolPreset = service.downPatrolPreset,
                    $scope.setMenu = service.setMenu,
                    $scope.setKeyFocus = service.setKeyFocus,
                    $scope.set3DZoom = service.set3DZoom,
                    $scope.verifySpeedAndTime = function (e, t) {
                        0 === e ? 0 >= parseInt($scope.oParams.aPatrolPreset[t].szSpeed) ? $scope.oParams.aPatrolPreset[t].szSpeed = 1 : parseInt($scope.oParams.aPatrolPreset[t].szSpeed) > 40 ? $scope.oParams.aPatrolPreset[t].szSpeed = 40 : isNaN(Number($scope.oParams.aPatrolPreset[t].szSpeed)) && ($scope.oParams.aPatrolPreset[t].szSpeed = 1) : 0 > parseInt($scope.oParams.aPatrolPreset[t].szTime) ? $scope.oParams.aPatrolPreset[t].szTime = 0 : parseInt($scope.oParams.aPatrolPreset[t].szTime) > 30 ? $scope.oParams.aPatrolPreset[t].szTime = 30 : isNaN(Number($scope.oParams.aPatrolPreset[t].szTime)) && ($scope.oParams.aPatrolPreset[t].szTime = 0)
                    }
                    ,
                    $scope.selectPreset = function (e) {
                        $scope.oParams.iPresetIndex = e
                    }
                    ,
                    $scope.selectPatrol = function (e) {
                        $scope.oParams.iPatrolIndex = e
                    }
                    ,
                    $scope.selectPattern = function (e) {
                        $scope.oParams.iPatternIndex = e
                    }
                    ,
                    $scope.ptzLoaded = function () {
                        service.initParams(),
                            e("#" + d + " #tabs").tabs({
                                remember: !1
                            }),
                            "ptzLock" != u ? ($scope.iPatrolPresetHeight = document.documentElement.clientHeight - 465,
                                e("#tabs-1, #tabs-2, #tabs-3").height(document.documentElement.clientHeight - 365)) : (e("#" + d + " .ptz-name").hide(),
                                    e("#" + d + " .ptz-ctrl-bottom").hide(),
                                    e("#" + d + " li").hide())
                    }
                    ,
                    $scope.update = function () {
                        service.updatePatrol()
                    }
            }
            ]),
                angular.bootstrap(angular.element("#" + d), ["ptzApp"])
        },
        update: function () {
            t.oParams.bAuto = i.m_aWndList[i.m_iWndIndex].bAutoPan,
                t.oParams.b3DZoom = i.m_aWndList[i.m_iWndIndex].b3DZoom,
                t.iChannelId = i.m_aWndList[i.m_iWndIndex].iChannelId,
                t.update(),
                t.$$phase || t.$apply()
        },
        updateChannelCap: function (e) {
            null !== t && (t.oPtzCap.b3DZoom = e.bSupportPosition3D,
                t.oPtzCap.bManualTack = e.bSupportManualTrack)
        }
    }
});
