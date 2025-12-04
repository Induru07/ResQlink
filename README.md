CLIENT SIDE (Frontend)                 SERVER SIDE (Backend)             DATA TIER
   =============================          =============================       =============

   [1] WEB DASHBOARD (Admins)              [3] API GATEWAY                    [5] DATABASE
   --------------------------             ---------------------              --------------
   (React.js / HTML / CSS)       HTTPS     |                   |              |            |
   - Live Heatmaps               <------>  |    NODE.JS        |  Mongoose    |  MONGODB   |
   - Inventory Management        (JSON)    |    EXPRESS        | <----------> |  ATLAS     |
                                           |    SERVER         |              |            |
                                           |                   |              | (Stores    |
   [2] MOBILE APP (GNs)                    |  - Auth (Login)   |              |  Families, |
   --------------------------              |  - Priority Alg.  |              |  Requests, |
   (React Native/Flutter?)       HTTPS     |  - Dupe Check     |              |  Stock)    |
   - Needs Assessment Form       <------>  |  - Route Logic    |              --------------
   - Offline Local Storage       (Sync)    |                   |
   - Photo Evidence                        |                   |             
                                           ---------------------            
                                                    
