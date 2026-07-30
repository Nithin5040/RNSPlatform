export const SummaryApi = {
  // Authentication
  login: {
    url: "/rna-service/authService/login",
    method: "post"
  },
  userdpwns: {
    url: "/rna-service/userCreation/userdpdwn",
    method: "post"
  },
  createUser: {
    url: "/rna-service/userCreation/createUser",
    method: "post"
  },
  routeplandpdwns: {
    url: "/rna-service/routeplan/routePlanDropdown",
    method: "post"
  },
  createrouteplan: {
    url: "/rna-service/routeplan/insertRoutePlan",
    method: "post"
  },
  fetchrouteplan: {
    url: "/rna-service/routeplan/fetchRoutePlan",
    method: "post"
  },
  updaterouteplan: {
    url: "/rna-service/routeplan/updateRoutePlan",
    method: "post"
  },
  masterroutedpdwns: {
    url: "/rna-service/UploadXl/masterDropdwn",
    method: "post"
  },
  masterrouteexcelupload: {
    url: "rna-service/UploadXl/Upload",
    method: "post"
  },
  drivercreationdpdwns: {
    url: "/rna-service/DriverCreation/fetchDropdown",
    method: "post"
  },
  drivercreation: {
    url: "/rna-service/DriverCreation/insertDriverDetails",
    method: "post"
  },
  assignroutedpdwns: {
    url: "/rna-service/assignDetail/fecthAssignDpdwn",
    method: "post"
  },
  assignroute: {
    url: "/rna-service/assignDetail/insertAssigndriver",
    method: "post"
  },
  driverdetails: {
    url: "/rna-service/Fetch/FetchDriverDetails",
    method: "post"
  },
  viewdriverdoc: {
    url: "/rna-service/View/ViewDriverDetails",
    method: "post"
  },
  editdriverdetails: {
    url: "/rna-service/Update/UpdateDriverDetails",
    method: "post"
  },
  adminzone: {
    url: "/rna-service/zone/zoneDrpDwn",
    method: "post"
  },
  admincount: {
    url: "/rna-service/rootstatuscount/assignRouteStatuscount",
    method: "post"
  },
  substationcount: {
    url: "/rns-service/substationstatuscount/subStationCountandStatus",
    method: "post"
  },
  completedRoutes: {
    url: "/rna-service/submittedDriverDetail/fetchDriverSubmittedDetails",
    method: "post"
  },
  assignroutecount: {
    url: "/rna-service/rootstatuscount/assignRoutecount",
    method: "post"
  },
  assignroutebasedonzone: {
    url: "/rna-service/rootstatuscount/assignRootFetchbasedonZoneMaster",
    method: "post"
  },
  substationCountBasedonAssignedRoot: {
    url: "/rna-service/rootstatuscount/substationCountBasedonAssignedRoot",
    method: "post"
  },
















































































  roles: {
    url: "/wfms-service/roleCreation",
    method: "post"
  },
  UserCreatedpdwns: {
    url: "/wfms-service/userCreation/userDpwns",
    method: "post"
  },
  UserCreation: {
    url: "/wfms-service/userCreation",
    method: "post"
  },
  changePassword: {
    url: "/wfms-service/userCreation/changePassword",
    method: "post"
  },
  loginDetails: {
    url: "/wfms-service/authService/login/userLoginDetails",
    method: "post"
  },
  dashboardCounts: {
    url: "/wfms-service/authService/getUser",
    method: "post"
  },
  UsersList: {
    url: "/wfms-service/authService/getUser/userList",
    method: "post"
  },
  EditUserList: {
    url: "/wfms-service/authService/getUser/editUser",
    method: "put"
  },
  MarketMobilising: {
    url: "/wfms-service/MarketMobiliSation",
    method: "post"
  },
  CandidateList: {
    url: "/wfms-service/feCandiDatesList",
    method: "post"
  },
  CandidateImage: {
    url: "/wfms-service/feCandiDatesList/fetchCandidatesImage",
    method: "post"
  },
  MisReportDrpdwns: {
    url: "/wfms-service/misReport/getdropdown",
    method: "post"
  },
  MisReport: {
    url: "/wfms-service/misReport",
    method: "post"
  },
  ReportingManagerList: {
    url: "/wfms-service/reportingTo",
    method: "post"
  },
  MainSites: {
    url: "/wfms-service/mainSites",
    method: "post"
  },
  SubSites: {
    url: "/wfms-service/subSite",
    method: "post"
  },
  NewPassword: {
    url: "/wfms-service/updatenewPassword",
    method: "post"
  },
  SeReport: {
    url: "/wfms-service/misReport/seReportDpdwn",
    method: "post"
  },
  ExitList: {
    url: "/wfms-service/rejoinAdmin/fetchforExitListAdmin",
    method: "post"
  },
  ReasonDpdwns: {
    url: "/wfms-service/rejoinAdmin/fetchReasonDpdwnAdmin",
    method: "post"
  },
  ExitFinalSubmit: {
    url: "/wfms-service/rejoinAdmin/submitVerifiedCandidateExitListAdmin",
    method: "post"
  },
  ExitCandidateList: {
    url: "/wfms-service/rejoinAdmin/fetchExitListAdmin",
    method: "post"
  },
  RejoinAdminList: {
    url: "/wfms-service/rejoinAdmin/fetchRejoinAdmin",
    method: "post"
  },
  RejoinFinalSubmit: {
    url: "/wfms-service/rejoinAdmin/rejoinCandidateAdmin",
    method: "post"
  },
  fetchAttendanceReport: {
    url: "/wfms-service/misReport/fetchAttendenceReport",
    method: "post"
  },
  SiteNewEntryReport: {
    url: "/wfms-service/misReport/siteNewEntryReport",
    method: "post"
  },
  fetchOtReport: {
    url: "/wfms-service/misReport/fetchOtReport",
    method: "post"
  },
  Dpdwndptdsg: {
    url: "/wfms-service/misReport/seReportDpdwnDptDsg",
    method: "post"
  },
  SiteEntryreport: {
    url: "/wfms-service/misReport/updateSiteEntryReport",
    method: "post"
  },
  FetchRejoinReport: {
    url: "/wfms-service/misReport/fetchRejoinReport",
    method: "post"
  },
  FetchExitReport: {
    url: "/wfms-service/misReport/fetchExitReport",
    method: "post"
  },
  ColonySiteEntryReport: {
    url: "/wfms-service/misReport/colonySiteEntryReport",
    method: "post"
  },
  fetchVerificationExitReport: {
    url: "/wfms-service/misReport/fetchVerificationExitReport",
    method: "post"
  },
  OnbaordCandidate: {
    url: "/wfms-service/onboard/FetchonboardCandidate",
    method: "post"
  },
  CandidateHistoryAadhaar: {
    url: "/wfms-service/historyReport/candidateHistorybyAadhar",
    method: "post"
  },
  CandidateHistoryGatePass: {
    url: "/wfms-service/historyReport/candidateHistorybyGatePass",
    method: "post"
  },
  CandidateHistoryDropdown: {
    url: "/wfms-service/onboard/DropdownforUpdate",
    method: "post"
  },
  UpdateOnboardCandidate: {
    url: "/wfms-service/onboard/UpdateonboardCandidate",
    method: "post"
  },
  ViewPan: {
    url: "/wfms-service/onboard/viewPan",
    method: "post"
  },
  ViewSign: {
    url: "/wfms-service/onboard/viewSign",
    method: "post"
  },
  ViewPhoto: {
    url: "/wfms-service/onboard/viewPhoto",
    method: "post"
  },
  ViewAadhar: {
    url: "/wfms-service/onboard/viewAadhar",
    method: "post"
  },
  ViewGatePass: {
    url: "/wfms-service/onboard/viewGatePass",
    method: "post"
  },
  ViewBankPassbook: {
    url: "/wfms-service/onboard/viewBankPassbook",
    method: "post"
  },
  DropdownforUpdate: {
    url: "/wfms-service/onboard/DropdownforUpdate",
    method: "post"
  },
  ReUploadupdateSiteEntry: {
    url: "/wfms-service/reupload_updateSiteEntry/reUploadupdateSiteEntry",
    method: "post"
  },
  loginDetailsReport: {
    url: "/wfms-service/misReport/fetchLoginDetails",
    method: "post"
  },
  CommonLoginReport: {
    url: "/wfms-service/misReport/commonLoginDetails",
    method: "post"
  },
  LoginFilter: {
    url: "/wfms-service/reportingManager/fetchLoginFilterTypeDrpDwn",
    method: "post"
  },
  RmDashboard: {
    url: "/wfms-service/reportingManager/Fetchreportingmanager",
    method: "post"
  },
  RmDashboardCounts: {
    url: "/wfms-service/reportingManager/FetchreportingmanagerCount",
    method: "post"
  },
  UpdateReportingManagerFePassword: {
    url: "/wfms-service/reportingManager/UpdateReportingManagerFePassword",
    method: "post"
  },
  RmRoleDpdwn: {
    url: "/wfms-service/reportingManager/FetchRoleDropDown",
    method: "post"
  },
  RmUserDpdwn: {
    url: "/wfms-service/reportingManager/FetchUserDropDown",
    method: "post"
  },
  RmLoginAudit: {
    url: "/wfms-service/reportingManager/FetchReportingManagerLoginDetails",
    method: "post"
  },
  TransferCandidate: {
    url: "/wfms-service/transferCandidate/FetchCandidateDetail",
    method: "post"
  },
  TransferCandidateSubmit: {
    url: "/wfms-service/transferCandidate/TransferCandidate",
    method: "post"
  },
  // RM Dashboard KPIs
  RmDashboardKpis: {
    url: "/wfms-service/ReportingManager/FetchLooginCountReportingManagerWeb",
    method: "post"
  },
  TeamInsightsCount: {
    url: "/wfms-service/ReportingManager/FetchTotalCountunderReportingManagerWeb",
    method: "post"
  },
  MonthWiseReport: {
    url: "/wfms-service/misReport/monthWiseReport",
    method: "post"
  },
  MonthWiseReportDetails: {
    url: "/wfms-service/misReport/monthWiseReportDetails",
    method: "post"

  }
};
