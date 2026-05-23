interface AppConfiguration {
  appName: string;
  appColor: string;
  borderColor: string;
  appTextColor: string;
  appLogoUrl: string;
  appNameAllCaps: string;
  footerName: string;
  footerLeyend: string;
  transferName: string;
  brandImg?: string;
  brandImg2?: string;
  authenticatorIcon?: string;
  appsStores?: string;
  mailBackground: string;
  fromEmail: string;
  appTitle: string;
  appTitleColor?: string;
  boucherFooter: string;
  boucherHeaderBackground?: string;
  boucherHaderLabelBackground?: string;
  boucherHeaderClass?: string;
  boucherHeaderLabelClass?: string;
  boucherFooterBackground?: string;
  boucherFooterClass?: string;
  boucherLogo?: string;
  serverUrl?: string;
  contactEmail?: string;
}

export const APPS: Map<string, AppConfiguration> = new Map();

APPS.set('masefe', {
  appName: 'masefe',
  appColor: '#FEC424',
  borderColor: '#afafaf',
  appTextColor: '#FFFFFF',
  appLogoUrl: '/imgs/logo/masefe.svg',
  appNameAllCaps: 'MASEFE',
  footerName: 'mas.efe',
  footerLeyend: 'tu medio de pago',
  transferName: '+EFE',
  mailBackground: '#ffffff',
  brandImg: '/imgs/brand-mf.png',
  brandImg2: '/imgs/brand-mf.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  fromEmail: 'no-reply@masefe.mx',
  appTitle: 'mas.efe',
  boucherFooter: 'mas.efe tu medio de pago',
  boucherHeaderClass: 'p-4 fs-4 mt-2 text-light bg-black',
  boucherFooterClass: 'text-light bg-black fs-4 py-4 justify-content-center text-center fw-bold mt-2',
  boucherLogo: '/imgs/boucher/logo-masefe.svg',
  serverUrl: 'https://cdn.ebanking-service.net',
});

APPS.set('livingrock', {
  appName: 'livingrock',
  appColor: '#F5F8FF',
  borderColor: '#C0DDFF',
  appTextColor: '#000000',
  appLogoUrl: '/imgs/logo/livingrock.svg',
  appNameAllCaps: 'LIVINGROCK',
  footerName: 'LivingRock',
  footerLeyend: 'tu opción de confianza',
  transferName: 'LivingRock',
  brandImg: '/imgs/brand-lr.png',
  brandImg2: '/imgs/brand-lr-02.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@livingrock.mx',
  appTitle: 'Living Rock',
  boucherFooter: 'LivingRock es tu medio de pago',
  boucherHeaderClass: 'p-4 fs-4 mt-2',
  boucherFooterClass: 'fs-4 py-5 justify-content-center text-center fw-bold',
  serverUrl: 'https://cdn.ebanking-service.net',
  contactEmail: 'soporte@livingrock.mx',
});

APPS.set('bambam', {
  appName: 'bambam',
  appColor: '#fff',
  borderColor: '#adadad',
  appTextColor: '#000000',
  appLogoUrl: '/imgs/logo/bambam.svg',
  appNameAllCaps: 'BAMBAM',
  footerName: 'Bam Bam',
  footerLeyend: 'tu opcion de confianza',
  transferName: 'BamBam',
  brandImg: '/imgs/brand-bambam.png',
  brandImg2: '/imgs/brand-bambam.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@bambam.mx',
  appTitle: 'Bam Bam',
  appTitleColor: '#FF4D11',
  boucherFooter: '¡Haz en un <span style="color: #FF4D11;">BAMBAM</span> tus pagos!',
  boucherHeaderClass: 'bg-bambam p-4 fs-4 mt-2',
  boucherLogo: '/imgs/boucher/logo-bambam.svg',
  boucherFooterClass: 'fs-4 py-5 justify-content-start text-start fw-bold',
  serverUrl: 'https://cdn.ebanking-service.net',
});

APPS.set('bitfin', {
  appName: 'bitfin',
  appColor: '#000000',
  borderColor: '#adadad',
  appTextColor: '#fff',
  appLogoUrl: '/imgs/logo/bitfin.svg',
  appNameAllCaps: 'BITFIN',
  footerName: 'BITFIN',
  footerLeyend: 'tu opcion de confianza',
  transferName: 'Bitfin',
  brandImg: '/imgs/brand-bitfin.png',
  brandImg2: '/imgs/brand-bitfin.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@bitfin.mx',
  appTitle: 'Bitfin',
  appTitleColor: '#000000',
  boucherFooter: 'Soluciones de pago internacionales',
  boucherHeaderClass: 'bg-black rounded-pill p-4 fs-4 mt-2 text-light',
  boucherFooterClass: 'fs-4 py-5 justify-content-start text-start fw-bold',
  serverUrl: 'https://cdn.ebanking-service.net',
});

APPS.set('88pay', {
  appName: '88pay',
  appColor: '#F9F9F9',
  borderColor: '#0478F3',
  appTextColor: '#000000',
  appLogoUrl: '/imgs/logo/88pay.svg',
  appNameAllCaps: '88PAY',
  footerName: '88PAY',
  footerLeyend: 'tu opcion de confianza',
  transferName: '88pay',
  brandImg: '/imgs/brand-88pay.png',
  brandImg2: '/imgs/brand-88pay.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@88pay.mx',
  appTitle: '88Pay',
  appTitleColor: '#000000',
  boucherFooter: 'Soluciones de pago internacionales',
  boucherHeaderClass: 'bg-88pay p-4 fs-4 text-light ',
  boucherLogo: '/imgs/boucher/logo-88pay.svg',
  boucherFooterClass: 'fs-4 py-5 justify-content-start text-start fw-bold',
  serverUrl: 'https://cdn.ebanking-service.net',
});

APPS.set('eplata', {
  appName: 'eplata',
  appColor: '#17204B',
  borderColor: '#adadad',
  appTextColor: '#000000',
  appLogoUrl: '/imgs/logo/eplata.svg',
  appNameAllCaps: 'EPLATA',
  footerName: 'EPLATA',
  footerLeyend: 'tu opcion de confianza',
  transferName: 'eplata',
  brandImg: '/imgs/brand-eplata.png',
  brandImg2: '/imgs/brand-eplata.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@eplata.mx',
  appTitle: 'eplata',
  appTitleColor: '#000000',
  boucherFooter: 'Soluciones de pago internacionales',
  boucherHeaderClass: 'bg-ligth p-4 fs-4 text-black border-bottom',
  boucherFooterClass: 'fs-4 py-5 justify-content-start text-start fw-bold',
  serverUrl: 'https://cdn.ebanking-service.net',
});

APPS.set('vive', {
  appName: 'vive',
  appColor: '#fff',
  borderColor: '#adadad',
  appTextColor: '#000000',
  appLogoUrl: '/imgs/logo/vive.svg',
  appNameAllCaps: 'VIVE CREDIT',
  footerName: 'Vive Credit',
  footerLeyend: 'tu opcion de confianza',
  transferName: 'VIVE',
  brandImg: '/imgs/brand-vive.png',
  brandImg2: '/imgs/brand-vive.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@bambam.mx',
  appTitle: 'Vive Credit',
  appTitleColor: '#000',
  boucherFooter: 'haz de tu vida financiera más fácil',
  boucherHeaderClass: ' fs-4 mt-2 text-white py-4 rounded-3 mx-1 px-2',
  boucherFooterClass: 'fs-4 py-5 justify-content-center text-center fw-bold',
  boucherLogo: '/imgs/boucher/logo-vive.svg',
  boucherHeaderBackground: `url("https://cdn.ebanking-service.net/imgs/boucher/bg-vive.png")`,
  serverUrl: 'https://cdn.ebanking-service.net',
});

APPS.set('gipago', {
  appName: 'gipago',
  appColor: '#0193E8',
  borderColor: 'rgba(1, 147, 232, 0.1)',
  appTextColor: '#000000',
  appLogoUrl: '/imgs/logo/gipago.svg',
  appNameAllCaps: 'GIPAGO',
  footerName: 'Gipago',
  footerLeyend: 'tu opcion de confianza',
  transferName: 'Gipago',
  brandImg: '/imgs/brand-gipago.png',
  brandImg2: '/imgs/brand-gipago.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@bambam.mx',
  appTitle: 'Gipago',
  appTitleColor: '#000',
  boucherFooter: '<p>Somos tu método de <span class="fw-bold">pago</span></p>',
  boucherHeaderClass: 'bg-gipago-1  fs-4 text-black border-bottom',
  boucherFooterClass: 'fs-4 py-5 justify-content-end text-end text-gipago',
  boucherHeaderLabelClass: 'bg-gipago-2 rounded-start-pill text-white px-2 py-2 ps-5',
  serverUrl: 'https://cdn.ebanking-service.net',
});

APPS.set('black_plus', {
  appName: 'black_plus',
  appColor: 'rgba(96, 84, 255, 0.05)',
  borderColor: '#BFF7F3',
  appTextColor: '#000000',
  appLogoUrl: '/imgs/logo/black_plus.svg',
  appNameAllCaps: 'BLACK +',
  footerName: 'Black +',
  footerLeyend: 'tu opcion de confianza',
  transferName: 'Black +',
  brandImg: '/imgs/brand-black_plus.png',
  brandImg2: '/imgs/brand-black_plus.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@blackplus.mx',
  appTitle: 'Black +',
  appTitleColor: '#000',
  boucherFooter: '<p>Somos tu método de <span class="fw-bold">pago</span></p>',
  boucherHeaderClass: 'fs-4 text-black border-bottom bg-black_plus',
  boucherFooterClass: 'fs-4 py-5 justify-content-end text-end',
  boucherHeaderLabelClass: 'rounded-start-pill text-black px-2 py-2 ps-5',
  serverUrl: 'https://cdn.ebanking-service.net',
});

APPS.set('xecora', {
  appName: 'xecora',
  appColor: '#1AE54E',
  borderColor: '#BFF7F3',
  appTextColor: '#000000',
  appLogoUrl: '/imgs/logo/xecora.svg',
  appNameAllCaps: 'Xecora',
  footerName: 'Xecora',
  footerLeyend: 'tu opcion de confianza',
  transferName: 'Xecora',
  brandImg: '/imgs/brand-xecora.png',
  brandImg2: '/imgs/brand-xecora.png',
  authenticatorIcon: '/imgs/icon-authentic.png',
  appsStores: '/imgs/icons-asppstore.png',
  mailBackground: '#f5f8ff',
  fromEmail: 'no-reply@blackplus.mx',
  appTitle: 'Xecora',
  appTitleColor: '#000',
  boucherFooter: '<p>Somos tu método de <span class="fw-bold">pago</span></p>',
  boucherHeaderClass: 'fs-4 text-black border-bottom bg-xecora',
  boucherFooterClass: 'fs-4 py-5 justify-content-end text-end',
  boucherHeaderLabelClass: 'rounded-start-pill text-black px-2 py-2 ps-5',
  serverUrl: 'https://cdn.ebanking-service.net',
});
