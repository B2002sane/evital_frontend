export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

// Récupérer l'objet current_user depuis le localStorage
const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');

// Vérifier si currentUser et le rôle existent
const userRole = currentUser?.role; // "MEDECIN", "MEDECIN_CHEF", ou autre rôle

export const NavigationItems: NavigationItem[] = [
  // {
  //   id: 'dashboard',
  //   title: '',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'default',
  //       title: 'Dashboard',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/dashboard/default',
  //       icon: 'dashboard',
  //       breadcrumbs: false
  //     }
  //   ]
  // },
  {
    id: 'authentication',
    title: '',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        icon:'dashboard',
        classes: 'nav-item',
        url: '/dashboard/default',
       
      },
      {
        id: 'personnel-medical',
        title: 'Personnels Medical',
        type: 'item',
        icon: 'profile',
        classes: 'nav-item',
        url: '/personnel-medical',
       
      },
      {
        id: 'dashboard',
        title: 'Patient',
        type: 'item',
        icon: 'user',
        classes: 'nav-item',
        url: '/patient',
    
      },
      {
        id: 'register',
        title: 'Gestion Chambres',
        type: 'item',
        icon: 'wallet',
        classes: 'nav-item',
        url: '/gestion-chambre',
     
      },
      {
        id: 'dashboard',
        title: 'Rendez-vous',
        type: 'item',
        icon: 'bell',
        classes: 'nav-item',
        url: '/rendez-vous',
     
      },
      {
        id: 'register',
        title: 'Don de Sang',
        type: 'item',
        icon:'login',
        classes: 'nav-item',
        url: '/demande-don',
       
      }
    ]
  },
  // {
  //   id: 'utilities',
  //   title: '',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'typography',
  //       title: 'Personnels Medicals',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/typography',
  //       icon: 'font-size'
  //     },
  //     {
  //       id: 'color',
  //       title: 'Patient',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/color',
  //       icon: 'bg-colors'
  //     },
  //   ]
  // },

  // {
  //   id: 'other',
  //   title: '',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'sample-page',
  //       title: 'Gestion Chambres',
  //       type: 'item',
  //       url: '/sample-page',
  //       classes: 'nav-item',
  //       icon: 'chrome'
  //     }
  //   ]
  // }
];



// Si le rôle de l'utilisateur n'est pas 'MEDECIN_CHEF', supprimer l'élément 'Personnels Medical'
if (userRole !== 'MEDECIN_CHEF') {
  NavigationItems[0].children = NavigationItems[0].children?.filter(
    (item) => item.id !== 'personnel-medical'
  );
}

console.log(NavigationItems); // Affiche les éléments du menu filtrés
