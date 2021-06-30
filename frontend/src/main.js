import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleUp, faAngleDown, faComments, faComment, faSearch, faRobot, faReply, faPencilAlt, faTrashAlt, faSortAmountDown, faPlus, faFire, faChartLine, faUser, faUserTie, faUserCircle, faEnvelope, faUsers, faScroll, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faAngleUp, faAngleDown, faComments, faComment, faSearch, faRobot, faReply, faPencilAlt, faTrashAlt, faSortAmountDown, faPlus, faFire, faChartLine, faUser, faUsers, faUserTie, faUserCircle, faEnvelope, faScroll, faPaperPlane);

console.log(process.env.VUE_APP_SERVER);

createApp(App).use(router).component("font-awesome-icon", FontAwesomeIcon).mount('#app');
