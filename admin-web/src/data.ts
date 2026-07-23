import { Product, Category, User, Order, ProductStatus, UserTier, OrderStatus } from "./types";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    sku: "TRN-2940",
    name: "Silk Drape Blouse",
    description: "A high-fashion drape blouse in ivory silk. Relaxed cut with soft, structured editorial lines.",
    categoryName: "Apparel",
    price: 420.00,
    stock: 24,
    status: ProductStatus.ACTIVE,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLyYNw3fZLxaU8gUy42DXjF5L0FvxXtpY4EMltpaJQBD_h1BMfIYST6LeBGrVEU_vzJnldoBCQR6zDVcbs7tHKnRfcCJzkup5ae2CDAfXTWRoiNOCbErrpbQ8_s7vhj5mCseoFLAZw1YJuIt8x02N9BeyGazR7j3NGfMToOKEE6Tf2HgslO7txs-VG3PfueEc7anU7sXT3N6FGGHyigLIm9CMqZ67MmXlBg-q-EOFwFZAmGHfFvG19lnneG1poT4S-7FEfN-nqVrQ",
    lastModified: "Just now"
  },
  {
    id: "prod-2",
    sku: "TRN-8812",
    name: "Nocturne Tote Bag",
    description: "Obsidian black luxury pebble-grain leather handbag with structured gold hardware details.",
    categoryName: "Accessories",
    price: 1250.00,
    stock: 4,
    status: ProductStatus.ACTIVE, // will represent Low Stock in list if stock < 5
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEOPwEBNGR_odUyRzx0TkY33SRXsE61gO3vik-QshFF3DJTSRduKRajNhC7YTGICb_wGPgxavD87BCbPbzDbjDAVhT3P7CuCcHRR6d-V9UAO07wcx71kQYg6w_L6ch0yoLKwP4PuTQGpkr10FK0QMuSlni8fFa9j_TYKy01ylGSOzWEXKHInC10apRedaNdecLRczJvTHQhWKlbsPReHZdUPjl7qeks_3K72wPcdBJjyx2RWLMCnZ8PRO6vXV73K2ynx0mqOhgffE",
    lastModified: "2 hours ago"
  },
  {
    id: "prod-3",
    sku: "TRN-5521",
    name: "Terra Suede Boot",
    description: "Modern minimalist Chelsea boot in high-key matte brown suede leather.",
    categoryName: "Footwear",
    price: 580.00,
    stock: 0,
    status: ProductStatus.ARCHIVED, // represents Out of Stock in list
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDY0kFA7AX3qkrRTW1CeHXreCxcMMXHKammx6h7VxNqN1ioUiJ_-5Fxk1D0YAjAsJs8RuMRPZu8kfG5eSq5hGM3roxNhl67-xWRQgJtQ4pAwuz3BEqW_pK-xztQ0v4AOpPqwBif3Db_spH92wtFOJvb3iDJOq7XUfOiPL-3UVxaenH1XiSEb6Bq6MGVNLe8CjqabYh9l3yOQ7nfh6PY5L7pC_8xDpyQmOme8vtUI0eiwMUSK9LG6v9DDLddTZx9Xs9w2N7SJ9W1wWY",
    lastModified: "1 day ago"
  },
  {
    id: "prod-4",
    sku: "TRN-0102",
    name: "Monolith Wool Coat",
    description: "Tailored charcoal wool overcoat with elongated sharp drape features.",
    categoryName: "Apparel",
    price: 1850.00,
    stock: 12,
    status: ProductStatus.ACTIVE,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzs3xESa3kFaTgeo1OEql9M_DQSMdGcmnAufeWTNpbdgUYTLz5kODS3Fdp8OP2m0nJ-ddost8ReUpmTGbT6jKmbH--0xQQfF5NO3f5YXaKjqEqu-jb1ct5x20-2qU48AUoSaS1mYkAu6_4UdYnOQzOoj7EEjLfBvTSwq6ZJDFanE03tfNaTy4PTjNiNFl5mANlypgelYKXwJomyDDouWgicC_wnyCykXeaH3dd58oMZsGMDX92wOUXC7bAbtos5o0It1ZEtadCn5Q",
    lastModified: "3 days ago"
  }
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Dresses",
    description: "Evening, Cocktail, Day",
    isLive: true,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZRtyStlO4R3YNXC7BC6P69NEOwTmnd4-6dJXmFIDi7dDyFx4pL2KeHUXMsmnQptcBE_ROnAGqjkQmKqo3QskNjCIfdI660WMGUxFeRlK-mUCC_laS5ZuEMHq4sSt4fzlUTxgadG-g75izjZoMKuf8HhxdlWfEVnBJyfWaVOEGpRueJBC1Q_jRv_YLB_z2ifZicPsaMxrzyNbwjQ2j0jX9wwErIsfwSsCkGcqjC6WIb_gMabWcP71Pe-qh6vw1A7Q89r2RtyMlZB8",
    slug: "dresses",
    productCount: 142,
    lastUpdated: "Oct 24, 2024",
    updatedBy: "Alexander Vane"
  },
  {
    id: "cat-2",
    name: "Tops",
    description: "Blouses, Knitwear, Shirts",
    isLive: true,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ0DK1_a17cHf2eLjRHL6b_MKYUcJ_rTfu-BbCWzpBtHWTdOX7KYshI3rHueKGifXUR8gCMqMYLzru3FMxFRONUqhXK_4PvMbtefBTsRy44s6qp7BbrBss1R1kQtM1nFTS_5aNtFJm4kh188q2d5oN3Af941uT5u6moI1KQoZAZQzRdNx0uvRJ-BKpDCy8UO-WoirnillAz-GQkniURKfyYgReYorvX1kjlAJWStcRDnyMVTYpSDdDo9NzDbv_-KJWvG30h_-xZ2o",
    slug: "tops",
    productCount: 218,
    lastUpdated: "Oct 22, 2024",
    updatedBy: "System"
  },
  {
    id: "cat-3",
    name: "Accessories",
    description: "Bags, Jewelry, Scarves",
    isLive: true,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoLklNtWvITwVOoqtdsbjlVD-5T_fe1UPOoZEHsS2slRQuueWeZFhXFFCmEsQ2bViK0YXPWacCXVV1W6zRtD-qU8Lp0vCDk15RxppF3PoayJfv-aJzyssg5s0od8gcCMGu6AyXLdpxsut1SpLsk6FMtWOD2L6oBOcxhrbFeGF92EvZXx6GkZh_vkp9Y1UfiC0gvdKyNOiSe7stievshgk_pNhudW6WZ1kJuAb2cwN6AZjD-euYfrauA9SndEId8EFpChzPln9Fm4Y",
    slug: "accessories",
    productCount: 354,
    lastUpdated: "Oct 20, 2024",
    updatedBy: "L. Chen"
  },
  {
    id: "cat-4",
    name: "Footwear",
    description: "Heels, Boots, Flats",
    isLive: true,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4itYBwukfxjrsKOxK1COWCDz5_nJNuVU3REFPa_PaGZC3CMs0JOQGWuqsPalHrRWGIrBbrDqCf-s-8bAvK11BidQkQo1WuRSuLyVqRBDmV86cDCmxayxWn3jJlgczjldFCu04S4YefJ3TEr4tSQIe3QDXK4rFcP1rREkeVFa3md22mSTDxZl15ZqT2GNwRap4GSR_TCJAdAaZulHjLk7EN5YC_bqVmoerg7VkRLJwYv3fhG9qbpObYRIpvOLVrtWUP6RfhHdrGxM",
    slug: "footwear",
    productCount: 128,
    lastUpdated: "Oct 15, 2024",
    updatedBy: "System"
  }
];

export const DEFAULT_USERS: User[] = [
  {
    id: "TRND-8291",
    name: "Lê Minh Anh",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1clbHOyNnTR6QDB36NmyYLKJrqsWG5-dw9EtcvafNBF-j3DmpziQAIZfwfX_jLbzC170zrvqvrK1V3Umb4rcu-tYXHCaVv7OvuCTzN8K8FVaSSoUlypyLBIsbLTrBMh72KDhnnwmFExWy9k35ioRh471TNGqYpx-oK8qd8o0GHgjNRdUaoRvCEa0hXHK4fbkHm81RR5BpFuxOi8_cFCINEXaDG5YQb1FLGF2z3G-F2etHiWFVrdmfQF0B8u42f3Tg3hpEMXYZh0A",
    tier: UserTier.GOLD,
    email: "minhanh.le@example.com",
    joinedDate: "12/10/2023"
  },
  {
    id: "TRND-5542",
    name: "Nguyễn Hoàng Nam",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqqj0m2P83YgpJpPgFbjunHtEpoNgyQlgh5RyfvIcz3oCK-pv8A55OKp2czv7ZY-GJJpZbti169BHCBtmmof46EtOYxB4IqRm1natvHg6PNBfxbP2WSugbzSyC42nHtsGekr1vcUa_OgqWt3g-jcpSK-7E0axcpkcJYT3F02fMvZneGUQAP88Y7mGDWOWmG6pNNKaG382sMcaajcNjlUkd9bH6WC2pJImAGtWASorZXrBX8fDMJhYudImOX-_y0WbeFc1oFb9aAHM",
    tier: UserTier.SILVER,
    email: "nam.nguyen@example.com",
    joinedDate: "05/11/2023"
  },
  {
    id: "TRND-3120",
    name: "Trần Thu Hà",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE5h0HhfN2mDlNPk_SeC9HxgzTHD_3Xbs2g5YvztBsmecNszQaVVcTdwjtpVq6_27dQFWqWkoosDR6BLKH3k7-cljsmU1rZZbhvZQzF55QH1vIlJPP8A7foErdXG_pUMrpOfcHKSvbnVY4KQE3_88SRmpGny30L525gtJ5FJcIl8MW-LDVXxtEEO0WV2FaIA2ImHmfBYYtX5JC2nndYeD9LwcR1l3uXwAaP70yG8GIObC1AOrAKl_3t2Ar0Zx_iirDoleF0szExE0",
    tier: UserTier.GOLD,
    email: "ha.tran@example.com",
    joinedDate: "28/08/2023"
  },
  {
    id: "TRND-1029",
    name: "Phạm Quốc Bảo",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnbC3QjB0SxNcKChczZDV47aV25ZiCutGNnhs3fYZT7-fZYBGi3PACD6Vnp4LXaHWT3py4HFNnoVMMJtpPQZTrdAS6TzXWwaTi6wC2pYU5N5nLW66eP0kXlMNYQc2J3PxXK9KyFIz1xq1upxUqB23ga6c8Lo0uG8UzimZiQYolb0neVPKdUBCCpJdBkEwgAlXRXweDTFe_jkdOp989i31T6c_S0K6FKtkI08a4TccQ6duIcrIjGiy_uE-sZr0jU2HPcvO_sazwsgw",
    tier: UserTier.SILVER,
    email: "bao.pham@example.com",
    joinedDate: "15/09/2023"
  }
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: "TRD-90124",
    customerName: "Nguyễn Minh Tú",
    customerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1clbHOyNnTR6QDB36NmyYLKJrqsWG5-dw9EtcvafNBF-j3DmpziQAIZfwfX_jLbzC170zrvqvrK1V3Umb4rcu-tYXHCaVv7OvuCTzN8K8FVaSSoUlypyLBIsbLTrBMh72KDhnnwmFExWy9k35ioRh471TNGqYpx-oK8qd8o0GHgjNRdUaoRvCEa0hXHK4fbkHm81RR5BpFuxOi8_cFCINEXaDG5YQb1FLGF2z3G-F2etHiWFVrdmfQF0B8u42f3Tg3hpEMXYZh0A",
    email: "minhtu.nguyen@vogue.com",
    phone: "+84 90 123 4567",
    address: "Số 123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    subtotal: 16700000,
    shippingFee: 150000,
    total: 16850000,
    paymentMethod: "Visa Thẻ tín dụng",
    paymentEndingCard: "(*4421) Stripe Integration",
    status: OrderStatus.PENDING,
    date: "24/10/2023",
    time: "14:30",
    items: [
      {
        id: "item-1",
        sku: "TRD-DR-001",
        name: "Váy Silk Đen Tối Giản",
        size: "Small (S)",
        quantity: 1,
        price: 4500000,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzabtit9ryj1iaIWTEikspvdOWAwBzz72ADKn0fNMR9wWp_HiMGe9g9f_ugO-BXmPvm8-8YIoy72RgbmaUTB098drxNzFD66-jtoMTRJRxMqxE7jRrYG541VXA5m3XXPBg_youmhkYymFvNAU2CRA89Wg7cuhQODckrsuq-bdWzWXS3ofL13i27ajPa7Nsv5jG4uVMIsDa9y8J6CP5Ufs_iES7DwRf9kKuF3AoOXV2hz9Psf_tw3nATEQMUY1qD677jBa4j2C17tc"
      },
      {
        id: "item-2",
        sku: "TRD-BG-042",
        name: "Túi Cầm Tay Ivory Gold",
        color: "Trắng Ngà",
        quantity: 1,
        price: 12200000,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuByHOTopoDQsaVD2gwdABd_yVVn57aNRtCOm51GaRFBt2zKGWM2cglN2wNXfgI-eDAW-CWwFyeEX4v6lloxe2TyrNtCFKDzhaXAtCMBnm0tQgor3V4RVtnNYa6lMzdFhjflCnTbpTIoqsIlNeGrywY_Hi-MAzPDo6RTU2mJ76VHhIu9xFkHykz6ZCL8g4NY-CAzUk_8NOUXm5OVIUOlu64xQDsI2fQb0fsYxQxIWYTIn1As1RMSBHG0rc9qgpNaEtTq3d_9vDGI1vU"
      }
    ],
    timeline: {
      confirmed: { active: true, time: "Hôm nay, 14:35" },
      packing: { active: true, time: "Hôm nay, 15:00" },
      shipping: { active: false, time: "Dự kiến: Ngày mai" },
      delivered: { active: false, time: "Chờ cập nhật" }
    }
  },
  {
    id: "TR-88210",
    customerName: "Nguyễn Minh Anh",
    customerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYpXoY083MUxkAcrXv2sbKaQWmqfNJ30FFsar0u-ZDlwOBTqil_NFhMesURtP-5Zk2nV1nFKMEmGsE9E79q03lHl7IZ0lsL1kAvvoUDnjcPHex-408p9qUlkfh-2w1FCEJVEtPzVohz_XVgYJI0QcHcjhcyiR1K0rq9ZvM6lQh4NFpILjD-91OeZPKlhqkyYvb-taxVGymc_eNr_tPEGWglWRgxvyBDYGFXVCuo03aQHrzcVkz5E-l6nzYiHFtsDcmkoNx27jijYo",
    email: "minhanh.le@example.com",
    phone: "+84 90 999 8888",
    address: "Boutique Residence, Tây Hồ, Hà Nội",
    subtotal: 4500000,
    shippingFee: 0,
    total: 4500000,
    paymentMethod: "Thẻ Visa",
    paymentEndingCard: "Visa 2034",
    status: OrderStatus.PENDING,
    date: "12/05/2024",
    time: "09:15",
    items: [
      {
        id: "tr88-item-1",
        sku: "TRD-DR-001",
        name: "Silk Evening Gown",
        size: "Medium",
        quantity: 1,
        price: 4500000,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzabtit9ryj1iaIWTEikspvdOWAwBzz72ADKn0fNMR9wWp_HiMGe9g9f_ugO-BXmPvm8-8YIoy72RgbmaUTB098drxNzFD66-jtoMTRJRxMqxE7jRrYG541VXA5m3XXPBg_youmhkYymFvNAU2CRA89Wg7cuhQODckrsuq-bdWzWXS3ofL13i27ajPa7Nsv5jG4uVMIsDa9y8J6CP5Ufs_iES7DwRf9kKuF3AoOXV2hz9Psf_tw3nATEQMUY1qD677jBa4j2C17tc"
      }
    ],
    timeline: {
      confirmed: { active: true, time: "12/05/2024, 09:30" },
      packing: { active: false, time: "Chờ lấy hàng" },
      shipping: { active: false, time: "Chờ giao hàng" },
      delivered: { active: false, time: "-" }
    }
  },
  {
    id: "TR-88209",
    customerName: "Trần Hoàng Long",
    customerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwwD2uhDtgaf3TPYetSy--MEzqSIvGKXiotIJb-ifYVSsvyTDJiegG6K_14KXBrH9sI_BSp9DGGwUw2d2NmFwR-TTXKB7nzzjGRsfpqjxyppdaWaRnS2DTGOH7xF5LoL38jGRKRb-xb9Gl58tU8uIbGnIm78BcKgWeGTksJTiD0TQPSq4vbLyjvX7RB4o3JPIp95Zt0775P5aqleIUEYS1yOafSZzLwhwrMV16t9M-qQ4ksfio4JbqeZSpu344sdO97xHMThYy8p4",
    email: "long.tran@example.com",
    phone: "+84 91 222 3333",
    address: "Melia Luxury Suite, Quận 3, TP. Hồ Chí Minh",
    subtotal: 12200000,
    shippingFee: 0,
    total: 12200000,
    paymentMethod: "Stripe Payment",
    paymentEndingCard: "MasterCard 4522",
    status: OrderStatus.SHIPPING,
    date: "11/05/2024",
    time: "17:40",
    items: [
      {
        id: "tr89-item-1",
        sku: "TRN-8812",
        name: "Onyx Cufflinks Collection",
        color: "Deep Black Onyx",
        quantity: 1,
        price: 12200000,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEOPwEBNGR_odUyRzx0TkY33SRXsE61gO3vik-QshFF3DJTSRduKRajNhC7YTGICb_wGPgxavD87BCbPbzDbjDAVhT3P7CuCcHRR6d-V9UAO07wcx71kQYg6w_L6ch0yoLKwP4PuTQGpkr10FK0QMuSlni8fFa9j_TYKy01ylGSOzWEXKHInC10apRedaNdecLRczJvTHQhWKlbsPReHZdUPjl7qeks_3K72wPcdBJjyx2RWLMCnZ8PRO6vXV73K2ynx0mqOhgffE"
      }
    ],
    timeline: {
      confirmed: { active: true, time: "11/05/2024, 18:00" },
      packing: { active: true, time: "12/05/2024, 08:30" },
      shipping: { active: true, time: "12/05/2024, 12:44" },
      delivered: { active: false, time: "Đang giao bởi GHTK" }
    }
  },
  {
    id: "TR-88208",
    customerName: "Lê Thị Thanh Hà",
    customerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4sAN7mAKUbP57t2LBPIHTKgAOJC2eseCYT0NnoKatt2HSM27jTZW7Udk2QdRNmPEVpYGYc08MHsVDc9xpD3hY1TYJISFKade2JuFRsjx7RUC8QSr2StnTpqt5fuM2kj0RxExaZc8f4j0dzzVbMSHuC09mbv4gag-lH1zBvTpEQAMAs66Xul2rjHEoideXHgPguBmvSd8qB9T8wqnb-8NPmOW6GPVMDabiw_MoUqe3NxN2Oen1ekUFkq8H79h0HU0gbrzmzB9uJIk",
    email: "thanhha.le@example.com",
    phone: "+84 94 444 5555",
    address: "Vinhomes Metropolis, Liễu Giai, Ba Đình, Hà Nội",
    subtotal: 8900000,
    shippingFee: 0,
    total: 8900000,
    paymentMethod: "Apple Pay",
    paymentEndingCard: "Device Card *0911",
    status: OrderStatus.DELIVERED,
    date: "11/05/2024",
    time: "10:30",
    items: [
      {
        id: "tr88-item-1",
        sku: "TRN-9912",
        name: "Silk Evening Scarf & Cashmere",
        size: "One Size",
        quantity: 1,
        price: 8900000,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLyYNw3fZLxaU8gUy42DXjF5L0FvxXtpY4EMltpaJQBD_h1BMfIYST6LeBGrVEU_vzJnldoBCQR6zDVcbs7tHKnRfcCJzkup5ae2CDAfXTWRoiNOCbErrpbQ8_s7vhj5mCseoFLAZw1YJuIt8x02N9BeyGazR7j3NGfMToOKEE6Tf2HgslO7txs-VG3PfueEc7anU7sXT3N6FGGHyigLIm9CMqZ67MmXlBg-q-EOFwFZAmGHfFvG19lnneG1poT4S-7FEfN-nqVrQ"
      }
    ],
    timeline: {
      confirmed: { active: true, time: "11/05/2024, 11:00" },
      packing: { active: true, time: "11/05/2024, 14:00" },
      shipping: { active: true, time: "11/05/2024, 16:30" },
      delivered: { active: true, time: "12/05/2024, 11:15" }
    }
  },
  {
    id: "TR-88207",
    customerName: "Phạm Quốc Việt",
    customerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3gTDkkXigMijCJE7vO0XhhO9nLxGb_zCloZ6w2lmHaF4P2gHm-qDJfN45mOrsEiWV1WscFmrqM3LQeB6jkjgSJZ6dXt-nF6wa2zA1TmeSLf7hH7ovfBetI1kMzgRdMu31a3opPyyhl_qNKnuhNDpIq7MoobJv6DmCCzPQy0kVLDY-4JVh2SUy5MekXKTyhU4xRArTIdp7A8k3Y55bPh-btmF3RJuyAyJ65a0SBb9fmVAk5APNTN6Efmd8KGSl7mKg6KeDB2Dht1w",
    email: "viet.pham@example.com",
    phone: "+84 93 111 2222",
    address: "Sunrise City Tower V, Quận 7, TP. Hồ Chí Minh",
    subtotal: 2750000,
    shippingFee: 0,
    total: 2750000,
    paymentMethod: "Visa Premium",
    paymentEndingCard: "Visa 8812",
    status: OrderStatus.DELIVERED,
    date: "10/05/2024",
    time: "15:20",
    items: [
      {
        id: "tr87-item-1",
        sku: "TR-BOOT-092",
        name: "Terra Suede Desert Boot",
        size: "42",
        quantity: 1,
        price: 2750000,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDY0kFA7AX3qkrRTW1CeHXreCxcMMXHKammx6h7VxNqN1ioUiJ_-5Fxk1D0YAjAsJs8RuMRPZu8kfG5eSq5hGM3roxNhl67-xWRQgJtQ4pAwuz3BEqW_pK-xztQ0v4AOpPqwBif3Db_spH92wtFOJvb3iDJOq7XUfOiPL-3UVxaenH1XiSEb6Bq6MGVNLe8CjqabYh9l3yOQ7nfh6PY5L7pC_8xDpyQmOme8vtUI0eiwMUSK9LG6v9DDLddTZx9Xs9w2N7SJ9W1wWY"
      }
    ],
    timeline: {
      confirmed: { active: true, time: "10/05/2024, 15:45" },
      packing: { active: true, time: "10/05/2024, 18:00" },
      shipping: { active: true, time: "11/05/2024, 08:30" },
      delivered: { active: true, time: "11/05/2024, 17:00" }
    }
  },
  {
    id: "TR-88206",
    customerName: "Đặng Thu Thảo",
    customerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx0BytEzbLFBt7DZ-Usl9CoGOMmn3pka2w2C-VaTEzI0u9G5YDjLKH_k2SYEizcrJHowoz_uvob6rCujIkBm9_Il0bgp1yWsoaeWPAScV_-Ve4nNiMP3Ks4da4iIFLajJ48jmLkQ9e7Q09fBtq_RV8F7IBg-n31usB1gHlqxvAjEvoo0W8IC-UryWomSVJnCF8gzH2YwPvFdL5KaagiWtrQXngCpio2zGNGMEmhNKbL4c20Wfnpaf950gD4wfxNynPvx13KwqQXiM",
    email: "thao.dang@example.com",
    phone: "+84 90 777 6666",
    address: "Château Villa, Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh",
    subtotal: 15000000,
    shippingFee: 0,
    total: 15000000,
    paymentMethod: "Stripe Business",
    paymentEndingCard: "Amex Premium *1007",
    status: OrderStatus.PENDING,
    date: "10/05/2024",
    time: "11:30",
    items: [
      {
        id: "tr86-item-1",
        sku: "TRD-GOLD-99",
        name: "Bespoke Evening Silk Gown",
        size: "Small",
        quantity: 1,
        price: 15000000,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzabtit9ryj1iaIWTEikspvdOWAwBzz72ADKn0fNMR9wWp_HiMGe9g9f_ugO-BXmPvm8-8YIoy72RgbmaUTB098drxNzFD66-jtoMTRJRxMqxE7jRrYG541VXA5m3XXPBg_youmhkYymFvNAU2CRA89Wg7cuhQODckrsuq-bdWzWXS3ofL13i27ajPa7Nsv5jG4uVMIsDa9y8J6CP5Ufs_iES7DwRf9kKuF3AoOXV2hz9Psf_tw3nATEQMUY1qD677jBa4j2C17tc"
      }
    ],
    timeline: {
      confirmed: { active: true, time: "10/05/2024, 12:00" },
      packing: { active: false, time: "Chờ duyệt kho" },
      shipping: { active: false, time: "-" },
      delivered: { active: false, time: "-" }
    }
  }
];

/**
 * Persists DB and registers default tables with client standard local storage.
 */
export function getStoredData<T>(key: string, defaultVal: T[]): T[] {
  try {
    const val = localStorage.getItem(`trendify_db_${key}`);
    if (val) {
      return JSON.parse(val);
    }
  } catch (e) {
    console.error("Local Storage reading error:", e);
  }
  // Seeding default val and storing
  setStoredData(key, defaultVal);
  return defaultVal;
}

export function setStoredData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(`trendify_db_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Local Storage writing error:", e);
  }
}
