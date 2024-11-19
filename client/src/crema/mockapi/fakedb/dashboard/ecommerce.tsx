import { EcommerceType } from "@crema/types/models/dashboards/Ecommerce";

const ecommerceData: EcommerceType = {
  stateData: [
    {
      id: 3,
      icon: "domain",
      title: "Total Products",
      value: 2140,
      growth: 33,
      color: "#54B435",
    },
    {
      id: 2,
      icon: "local_shipping",
      title: "New Orders",
      value: 3100,
      growth: 33,
      color: "#ff3939",
    },
    {
      id: 1,
      icon: "point_of_sale",
      title: "Item Sales",
      value: 32100,
      growth: 33,
      color: "#0A8FDC",
    },
    {
      id: 4,
      icon: "supervisor_account",
      title: "Unique Visitors",
      value: 15000,
      growth: 21,
      color: "#F04F47",
    },
  ],
  popularProducts: [
    {
      id: 1,
      icon: "/assets/images/dashboard/product_image_1.png",
      name: "Sports Running Swim",
      price: 690,
      mrp: 800,
    },
    {
      id: 2,
      icon: "/assets/images/dashboard/product_image_2.png",
      name: "DJI Phantom Camera",
      price: 430,
      mrp: 640,
    },
    {
      id: 3,
      icon: "/assets/images/dashboard/product_image_3.png",
      name: "Tumble Clothes Dryer",
      price: 230,
      mrp: 550,
    },
    {
      id: 4,
      icon: "/assets/images/dashboard/product_image_4.png",
      name: "Apple Macbook Display 12 Inch",
      price: 679,
      mrp: 800,
    },
    {
      id: 5,
      icon: "/assets/images/dashboard/product_image_5.png",
      name: "PBluetooth Speaker",
      price: 440,
      mrp: 640,
    },
    {
      id: 6,
      icon: "/assets/images/dashboard/product_image_6.png",
      name: "T20 1500 Lumens LCD Projector",
      price: 233,
      mrp: 550,
    },
    {
      id: 7,
      icon: "/assets/images/dashboard/product_image_3.png",
      name: "Tumble Clothes Dryer",
      price: 230,
      mrp: 550,
    },
    {
      id: 8,
      icon: "/assets/images/dashboard/product_image_4.png",
      name: "Apple Macbook Display 12 Inch",
      price: 679,
      mrp: 800,
    },
    {
      id: 9,
      icon: "/assets/images/dashboard/product_image_3.png",
      name: "Tumble Clothes Dryer",
      price: 230,
      mrp: 550,
    },
    {
      id: 10,
      icon: "/assets/images/dashboard/product_image_4.png",
      name: "Apple Macbook Display 12 Inch",
      price: 679,
      mrp: 800,
    },
    {
      id: 11,
      icon: "/assets/images/dashboard/product_image_5.png",
      name: "PBluetooth Speaker",
      price: 440,
      mrp: 640,
    },
    {
      id: 12,
      icon: "/assets/images/dashboard/product_image_6.png",
      name: "T20 1500 Lumens LCD Projector",
      price: 233,
      mrp: 550,
    },
  ],
  reportData: [
    {
      id: 1,
      value: "785K+",
      type: "Yearly Traffic",
      changes: "10",
      icon: "public",
      color: "#3d5afe",
      graphData: [
        { month: "Aug", number: 310 },
        { month: "Sep", number: 130 },
        { month: "Oct", number: 350 },
        { month: "Nov", number: 170 },
        { month: "Dec", number: 400 },
      ],
    },
    {
      id: 2,
      value: "$457K+",
      type: "Yearly Profit",
      changes: "5",
      icon: "pie_chart",
      color: "#F04F47",
      graphData: [
        { month: "Aug", number: 310 },
        { month: "Sep", number: 130 },
        { month: "Oct", number: 350 },
        { month: "Nov", number: 170 },
        { month: "Dec", number: 400 },
      ],
    },
    {
      id: 3,
      value: "565K+",
      type: "Yearly Sale Report",
      changes: "15",
      icon: "bar_chart",
      color: "#54B435",
      graphData: [
        { month: "Aug", number: 310 },
        { month: "Sep", number: 130 },
        { month: "Oct", number: 350 },
        { month: "Nov", number: 170 },
        { month: "Dec", number: 400 },
      ],
    },
    {
      id: 4,
      value: "$340K+",
      type: "Yearly Revenue",
      changes: "12",
      icon: "account_balance_wallet",
      color: "#0BBFDB",
      graphData: [
        { month: "Aug", number: 310 },
        { month: "Sep", number: 130 },
        { month: "Oct", number: 350 },
        { month: "Nov", number: 170 },
        { month: "Dec", number: 400 },
      ],
    },
  ],
  revenueData: [
    {
      id: 1,
      name: "Sports Running Swim",
      value: 85,
    },
    {
      id: 2,
      name: "DJI Phantom Camera",
      value: 60,
    },
    {
      id: 3,
      name: "Apple Macbook Display 12 Inch",
      value: 56,
    },
    {
      id: 4,
      name: "PBluetooth Speaker",
      value: 43,
    },
    {
      id: 5,
      name: "DJI Phantom Camera",
      value: 60,
    },
    {
      id: 6,
      name: "Apple Macbook Display 12 Inch",
      value: 56,
    },
    {
      id: 7,
      name: "Sports Running Swim",
      value: 85,
    },
    {
      id: 8,
      name: "PBluetooth Speaker",
      value: 43,
    },
  ],
  bestSellers: [
    {
      id: 1,
      name: "Emma M. Haag",
      weekDate: "22 Nov 2020",
      profile_pic: "/assets/images/avatar/A10.jpg",
      sales: "150",
      rating: 5,
    },
    {
      id: 2,
      name: "Evelyn F. Means",
      weekDate: "20 Nov 2020",
      profile_pic: "/assets/images/avatar/A13.jpg",
      sales: "145",
      rating: 4.5,
    },
    {
      id: 3,
      name: "Jamie R. Steen",
      weekDate: "22 Dec 2020",
      profile_pic: "/assets/images/avatar/A14.jpg",
      sales: "140",
      rating: 5,
    },
    {
      id: 4,
      name: "Jone B. Rilea",
      weekDate: "22 Nov 2020",
      profile_pic: "/assets/images/avatar/A15.jpg",
      sales: "122",
      rating: 4.5,
    },
    {
      id: 5,
      name: "Emma M. Haag",
      weekDate: "19 Nov 2020",
      profile_pic: "/assets/images/avatar/A16.jpg",
      sales: "104",
      rating: 4.5,
    },
    {
      id: 6,
      name: "Emma M. Haag",
      weekDate: "22 Nov 2020",
      profile_pic: "/assets/images/avatar/A10.jpg",
      sales: "150",
      rating: 5,
    },
    {
      id: 7,
      name: "Evelyn F. Means",
      weekDate: "20 Nov 2020",
      profile_pic: "/assets/images/avatar/A13.jpg",
      sales: "145",
      rating: 4.5,
    },
    {
      id: 8,
      name: "Jamie R. Steen",
      weekDate: "22 Dec 2020",
      profile_pic: "/assets/images/avatar/A14.jpg",
      sales: "140",
      rating: 5,
    },
  ],
  siteVisitors: [
    {
      id: 1,
      color: "green",
      value: 45,
      icon: "/assets/images/dashboard/us.svg",
      country: "USA",
    },
    {
      id: 2,
      color: "orange",
      value: 98,
      icon: "/assets/images/dashboard/fr.svg",
      country: "France",
    },
    {
      id: 3,
      color: "blue",
      value: 86,
      country: "Germany",
      icon: "/assets/images/dashboard/gr.svg",
    },
    {
      id: 4,
      color: "red",
      value: 34,
      country: "Spain",
      icon: "/assets/images/dashboard/es.svg",
    },
    {
      id: 5,
      color: "red",
      value: 34,
      country: "India",
      icon: "/assets/images/dashboard/in.svg",
    },
  ],
  audienceData: [
    {
      id: 1,
      title: "17 - 30 Years old",
      value: 30,
      color: "#0A8FDC",
    },
    {
      id: 2,
      title: "31 - 50 Years old",
      value: 25,
      color: "#54B435",
    },
    {
      id: 3,
      title: ">=50 Year old",
      value: 25,
      color: "#ff3939",
    },
    {
      id: 4,
      title: "20 - 36 Years old",
      value: 20,
      color: "#F04F47",
    },
  ],
  topInquiries: [
    {
      id: 1,
      title: "Sports Running Swim",
      value: 25,
      color: "#0A8FDC",
    },
    {
      id: 2,
      title: "Tumble Clothes Dryer",
      value: 35,
      color: "#54B435",
    },
    {
      id: 3,
      title: "PBluetooth Speaker",
      value: 20,
      color: "#ff3939",
    },
    {
      id: 4,
      title: "T20 Lumens LCD Projecto",
      value: 20,
      color: "#F04F47",
    },
  ],
  schedules: [
    {
      id: 1,
      title: "Big billion day",
      day: 4,
      color: "#0A8FDC",
    },
    {
      id: 2,
      title: "World Duchenne Awareness Day",
      day: 7,
      color: "#ff528f",
    },
    {
      id: 3,
      title: "Chop Suey Day",
      day: 9,
      color: "#5269ff",
    },
    {
      id: 4,
      title: "Good friday",
      day: 12,
      color: "#ff3939",
    },
    {
      id: 5,
      title: "Birth day",
      day: 10,
      color: "#F04F47",
    },
    {
      id: 6,
      title: "Individual Rights Day",
      day: 14,
      color: "#63ff52",
    },
    {
      id: 7,
      title: "Black friday sale",
      day: 20,
      color: "#54B435",
    },
  ],

  marketingCampaign: [
    {
      id: 1,
      name: "Facebook Ads",
      description: "63 Likes, 387 Shares",
      icon: "/assets/images/dashboard/facebook_icon.png",
      graph: 20,
      growth: true,
      spent: "$125",
      duration: "Nov 08-28",
      budget: "$450",
    },
    {
      id: 2,
      name: "Twitter Ads",
      description: "83 Likes, 357 Shares",
      icon: "/assets/images/dashboard/twitter_icon.png",
      graph: -5,
      growth: false,
      spent: "$125",
      duration: "Nov 08-28",
      budget: "$450",
    },
    {
      id: 3,
      name: "Instagram",
      description: "163 Likes, 587 Shares",
      like: "Bicycle",
      share: "08-21-2020",
      icon: "/assets/images/dashboard/instagram_icon.png",
      graph: 20,
      growth: true,
      spent: "$125",
      duration: "Nov 08-28",
      budget: "$450",
    },
    {
      id: 4,
      name: "LinkedIn",
      description: "57 Likes, 250 Shares",
      like: "Bicycle",
      share: "08-21-2020",
      icon: "/assets/images/dashboard/linkedin_icon.png",
      graph: 25,
      growth: true,
      spent: "$125",
      duration: "Nov 08-28",
      budget: "$450",
    },
    {
      id: 5,
      name: "Youtube",
      description: "67 Likes, 457 Shares",
      like: "Bicycle",
      share: "08-21-2020",
      icon: "/assets/images/dashboard/youtube_icon.png",
      graph: 45,
      growth: true,
      spent: "$125",
      duration: "Nov 08-28",
      budget: "$450",
    },
    {
      id: 6,
      name: "Dribble",
      like: "Bicycle",
      description: "80 Likes, 200 Shares",
      share: "08-21-2020",
      icon: "/assets/images/dashboard/dribble_icon.png",
      graph: 25,
      growth: true,
      spent: "$125",
      duration: "Nov 08-28",
      budget: "$450",
    },
  ],
  recentOrders: [
    {
      id: "#SK231",
      customer: "Ina Hughes",
      product: "Bicycle",
      date: "08-21-2020",
      paymentType: "COD",
      price: "$125",
      status: "Cancelled",
    },
    {
      id: "#SK232",
      customer: "Myrtie Ferguson",
      date: "08-12-2020",
      product: "Addida Shoes",
      paymentType: "Prepaid",
      price: "$100",
      status: "Delivered",
    },
    {
      id: "#SK233",
      customer: "Johnny Herrera",
      date: "07-30-2020",
      product: "Sleeve Jacket",
      price: "$1,020",
      paymentType: "Prepaid",
      status: "Pending",
    },
    {
      id: "#SK234",
      customer: "Myrtie Ferguson",
      date: "08-12-2020",
      product: "Addida Shoes",
      paymentType: "Prepaid",
      price: "$100",
      status: "Delivered",
    },
    {
      id: "#SK235",
      customer: "Myrtie Ferguson",
      date: "08-12-2020",
      product: "Addida Shoes",
      paymentType: "Prepaid",
      price: "$100",
      status: "Delivered",
    },
    {
      id: "#SK236",
      customer: "Johnny Herrera",
      date: "07-30-2020",
      product: "Sleeve Jacket",
      price: "$1,020",
      paymentType: "Prepaid",
      status: "Pending",
    },
    {
      id: "#SK237",
      customer: "Ina Hughes",
      product: "Bicycle",
      date: "08-21-2020",
      paymentType: "COD",
      price: "$125",
      status: "Cancelled",
    },
    {
      id: "#SK238",
      customer: "Myrtie Ferguson",
      date: "08-12-2020",
      product: "Addida Shoes",
      paymentType: "Prepaid",
      price: "$100",
      status: "Delivered",
    },
  ],
  newCustomers: [
    {
      id: 10001,
      image: "/assets/images/avatar/A1.jpg",
      name: "Angelina Joew",
      orders: 0,
      color: "",
      message: "added courses to the new bucket.",
    },
    {
      id: 10002,
      image: "/assets/images/avatar/A2.jpg",
      name: "John Mathew",
      orders: 3,
      color: "",
      message: "like company website design.",
    },
    {
      id: 10003,
      image: "/assets/images/avatar/A3.jpg",
      name: "George Bailey",
      orders: 3,
      color: "",
      message: "followed your works",
    },
    {
      id: 10004,
      image: "/assets/images/avatar/A4.jpg",
      name: "Maria Lee",
      orders: 0,
      color: "",
      message: "liked origmi-creativity agency.",
    },
    {
      id: 10005,
      image: "/assets/images/avatar/A1.jpg",
      name: "Angelina Joew",
      orders: 4,
      color: "",
      message: "added courses to the new bucket.",
    },
  ],
  browser: [
    {
      id: 1,
      value: "35K users",
      name: "Firefox",
      icon: "/assets/images/dashboard/browser_crome.svg",
    },
    {
      id: 2,
      value: "39K users",
      name: "Safari",
      icon: "/assets/images/dashboard/browser_firefox.svg",
    },
    {
      id: 3,
      value: "3.2M users",
      name: "Google Chrome",
      icon: "/assets/images/dashboard/browser_internet_explore.svg",
    },
    {
      id: 4,
      value: "3.5M users",
      name: "Internet Explorer",
      icon: "/assets/images/dashboard/browser_safari.svg",
    },
    {
      id: 5,
      value: "3.5M users",
      name: "Firefox",
      icon: "/assets/images/dashboard/browser_firefox.svg",
    },
  ],
};

export default ecommerceData;
