// API สำหรับดึงข้อมูลสถานที่ท่องเที่ยว (ใช้ข้อมูลจาก database.sql)
class BuengkanAPI {
    constructor() {
        this.cache = new Map();
        this.buengkanCenter = {
            lat: 18.3609,
            lng: 103.6469
        };
        this.initializeData();
    }

    initializeData() {
        // ข้อมูลสถานที่ท่องเที่ยวจริงในบึงกาฬ (ตรงกับ database.sql)
        this.attractionsData = [
            {
                id: 1,
                title: 'ภูทอก',
                description: 'ภูเขาหินปูนโดดเด่นกลางที่ราบ มีสะพานไม้และบันไดเวียนสำหรับขึ้นไปชมวิวทิวทัศน์ 360 องศา',
                image: 'สถานที่ท่องเที่ยว/ภูทอก.png',
                category: 'attraction',
                rating: 5.0,
                latitude: 18.15090000,
                longitude: 103.45690000,
                address: 'ตำบลโคกก่อง อำเภอปากคาด จังหวัดบึงกาฬ 38140',
                opening_hours: '06:00 - 17:00 น. (อาจมีการปรับเปลี่ยนตามฤดู)',
                price: 'ไม่มีค่าเข้าชม'
            },
            {
                id: 2,
                title: 'น้ำตกถ้ำพระ',
                description: 'น้ำตกขนาดใหญ่ที่มีน้ำไหลตลอดปี ตั้งอยู่ในเขตป่าดงดิบ มีบรรยากาศร่มรื่น เหมาะสำหรับการพักผ่อน',
                image: 'สถานที่ท่องเที่ยว/น้ำตกถ้ำพระ.png',
                category: 'attraction',
                rating: 4.0,
                latitude: 18.29090000,
                longitude: 103.58690000,
                address: 'อุทยานแห่งชาติภูลังกา จังหวัดบึงกาฬ',
                opening_hours: '08:00 - 17:00 น.',
                price: 'คนไทย ผู้ใหญ่ 20 บาท, เด็ก 10 บาท / ต่างชาติ ผู้ใหญ่ 100 บาท, เด็ก 50 บาท'
            },
            {
                id: 3,
                title: 'บึงโขงโหลง',
                description: 'ทะเลสาบน้ำจืดขนาดใหญ่ มีความหลากหลายทางชีวภาพ โดยเฉพาะนกน้ำนานาชนิด เป็นแหล่งดูนกที่สำคัญ',
                image: 'สถานที่ท่องเที่ยว/บึงโขงโหลง.png',
                category: 'attraction',
                rating: 4.0,
                latitude: 18.41090000,
                longitude: 103.70690000,
                address: 'อำเภอบึงโขงหลง จังหวัดบึงกาฬ 38220',
                opening_hours: 'เปิดตลอดเวลา (เหมาะสมกับการเยี่ยมชมช่วงกลางวัน)',
                price: 'ไม่มีค่าเข้าชม'
            },
            {
                id: 4,
                title: 'ถ้ำนาคา',
                description: 'สถานที่ศักดิ์สิทธิ์ที่มีหินรูปร่างคล้ายพญานาคตามความเชื่อ ตั้งอยู่ในอุทยานแห่งชาติภูลังกา ต้องเดินเท้าขึ้นไป',
                image: 'สถานที่ท่องเที่ยว/ถ้ำนาคา.png',
                category: 'attraction',
                rating: 5.0,
                latitude: 18.22090000,
                longitude: 103.52690000,
                address: 'อุทยานแห่งชาติภูลังกา จังหวัดบึงกาฬ',
                opening_hours: '08:00 - 17:00 น. (ควรตรวจสอบการจองคิวก่อนเดินทาง)',
                price: 'คนไทย ผู้ใหญ่ 20 บาท, เด็ก 10 บาท / ต่างชาติ ผู้ใหญ่ 100 บาท, เด็ก 50 บาท'
            },
            {
                id: 5,
                title: 'วัดอาฮงศิลาวาส (สะดือแม่น้ำโขง)',
                description: 'วัดริมแม่น้ำโขง มีความเชื่อว่าเป็นจุดสะดือแม่น้ำโขง มีบรรยากาศเงียบสงบ สวยงาม',
                image: 'สถานที่ท่องเที่ยว/วัดอาฮงศิลาวาส.png',
                category: 'attraction',
                rating: 4.0,
                latitude: 18.37090000,
                longitude: 103.65690000,
                address: 'ตำบลหนองเข็ง อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                opening_hours: '06:00 - 18:00 น.',
                price: 'ไม่มีค่าเข้าชม'
            },
            {
                id: 6,
                title: 'หินสามวาฬ',
                description: 'กลุ่มหินขนาดใหญ่รูปร่างคล้ายปลาวาฬ 3 ตัว ตั้งอยู่บนหน้าผา สามารถมองเห็นวิวทิวทัศน์แม่น้ำโขงและฝั่งลาวได้สวยงาม',
                image: 'สถานที่ท่องเที่ยว/หินสามวาฬ.png',
                category: 'attraction',
                rating: 5.0,
                latitude: 18.36090000,
                longitude: 103.64690000,
                address: 'ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                opening_hours: '05:30 - 17:00 น. (ควรไปช่วงเช้าหรือเย็น)',
                price: 'ไม่มีค่าเข้าชม (มีค่าบริการรถรับ-ส่ง หากไม่ต้องการเดินเท้า)'
            },
            {
                id: 7,
                title: 'ตลาดริมโขงบึงกาฬ',
                description: 'ตลาดเช้าและเย็นริมแม่น้ำโขง มีอาหารพื้นเมือง สินค้าท้องถิ่น และบรรยากาศริมน้ำ',
                image: 'สถานที่ท่องเที่ยว/ตลาดริมโขงบึงกาฬ.png',
                category: 'attraction',
                rating: 3.0,
                latitude: 18.35090000,
                longitude: 103.63690000,
                address: 'ริมแม่น้ำโขง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                opening_hours: '06:00 - 18:00 น. (แต่ช่วงเย็นอาจมีร้านเปิดเยอะกว่า)',
                price: 'ขึ้นอยู่กับสินค้าที่ซื้อ'
            },
            {
                id: 8,
                title: 'หาดทรายขาว บึงกาฬ',
                description: 'หาดทรายริมแม่น้ำโขงในช่วงฤดูแล้งที่น้ำลด จะมีหาดทรายขาวละเอียดให้เดินเล่น พักผ่อน',
                image: 'สถานที่ท่องเที่ยว/หาดทรายขาว.png',
                category: 'attraction',
                rating: 3.0,
                latitude: 18.33090000,
                longitude: 103.61690000,
                address: 'ริมแม่น้ำโขง จังหวัดบึงกาฬ',
                opening_hours: 'เปิดตลอดเวลา (เหมาะสมกับการเยี่ยมชมช่วงกลางวัน)',
                price: 'ไม่มีค่าเข้าชม'
            },
            {
                id: 9,
                title: 'ศูนย์วิจัยและพัฒนาประมงน้ำจืดบึงกาฬ',
                description: 'สถานที่ศึกษาเกี่ยวกับสัตว์น้ำจืดในท้องถิ่น มีบ่อเลี้ยงปลาและนิทรรศการเล็กๆ',
                image: 'สถานที่ท่องเที่ยว/ศูนย์วิจัยและพัฒนาประมงน้ำจืดบึงกาฬ.png',
                category: 'attraction',
                rating: 2.0,
                latitude: 18.38090000,
                longitude: 103.66690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '08:30 - 16:30 น. (วันจันทร์-ศุกร์)',
                price: 'ไม่มีค่าเข้าชม'
            },
            {
                id: 10,
                title: 'แก่งอาฮง',
                description: 'แนวหินและเกาะแก่งกลางแม่น้ำโขงที่สวยงาม โดยเฉพาะในช่วงน้ำลดจะเห็นเกาะแก่งได้ชัดเจน',
                image: 'สถานที่ท่องเที่ยว/แก่งอาฮง.png',
                category: 'attraction',
                rating: 3.0,
                latitude: 18.34090000,
                longitude: 103.62690000,
                address: 'แม่น้ำโขง จังหวัดบึงกาฬ',
                opening_hours: 'เปิดตลอดเวลา (เหมาะสมกับการเยี่ยมชมช่วงกลางวัน)',
                price: 'ไม่มีค่าเข้าชม'
            }
        ];

        // ข้อมูลคาเฟ่ (ตรงกับ database.sql)
        this.cafesData = [
            {
                id: 101,
                title: 'The Good View Cafe & Restaurant',
                description: 'คาเฟ่และร้านอาหารริมแม่น้ำโขง บรรยากาศดี วิวสวย เหมาะแก่การนั่งชิล',
                image: 'คาเฟ่/The Good View Cafe & Restaurant.png',
                category: 'cafe',
                rating: 4.0,
                latitude: 18.36090000,
                longitude: 103.64690000,
                address: 'ริมแม่น้ำโขง จังหวัดบึงกาฬ',
                opening_hours: '10:00 - 22:00 น.',
                price: 'เครื่องดื่ม 60-120 บาท, อาหาร 100-250 บาท'
            },
            {
                id: 102,
                title: 'ลานไม้คาเฟ่',
                description: 'คาเฟ่สไตล์อบอุ่น มีมุมถ่ายรูปสวยๆ ขนมเค้กและกาแฟรสชาติดี',
                image: 'คาเฟ่/ลานไม้คาเฟ่.png',
                category: 'cafe',
                rating: 4.0,
                latitude: 18.37090000,
                longitude: 103.65690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '08:00 - 18:00 น.',
                price: 'เครื่องดื่ม 50-100 บาท, ขนม 60-150 บาท'
            },
            {
                id: 103,
                title: 'Black Coffee @ Bueng Kan',
                description: 'คาเฟ่กาแฟ Specialty มีเมล็ดกาแฟให้เลือกหลากหลาย บรรยากาศร้านน่านั่ง',
                image: 'คาเฟ่/Black Coffee @ Bueng Kan.png',
                category: 'cafe',
                rating: 4.0,
                latitude: 18.35090000,
                longitude: 103.63690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '07:30 - 17:00 น.',
                price: 'เครื่องดื่ม 60-150 บาท'
            },
            {
                id: 104,
                title: 'Boon Coffee (บุญคอฟฟี่)',
                description: 'คาเฟ่เล็กๆ บรรยากาศอบอุ่น มีกาแฟและเครื่องดื่มหลากหลาย พร้อมขนมเบเกอรี่',
                image: 'คาเฟ่/Boon Coffee (บุญคอฟฟี่).png',
                category: 'cafe',
                rating: 3.0,
                latitude: 18.34090000,
                longitude: 103.62690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '07:00 - 17:00 น.',
                price: 'เครื่องดื่ม 50-100 บาท'
            },
            {
                id: 105,
                title: 'Little Tree Cafe & Garden (ลิทเทิล ทรี คาเฟ่ แอนด์ การ์เด้น)',
                description: 'คาเฟ่ตกแต่งสวยงาม มีพื้นที่สวนเล็กๆ ให้ความรู้สึกสบายๆ เหมาะแก่การพักผ่อน',
                image: 'คาเฟ่/Little Tree Cafe & Garden (ลิทเทิล ทรี คาเฟ่ แอนด์ การ์เด้น).png',
                category: 'cafe',
                rating: 4.0,
                latitude: 18.33090000,
                longitude: 103.61690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '09:00 - 19:00 น.',
                price: 'เครื่องดื่ม 60-120 บาท'
            },
            {
                id: 106,
                title: 'Landscape camping café',
                description: 'คาเฟ่สไตล์แคมปิ้ง บรรยากาศธรรมชาติ เหมาะสำหรับผู้ที่ชอบความเป็นกันเอง',
                image: 'คาเฟ่/Landscape camping café.png',
                category: 'cafe',
                rating: 3.5,
                latitude: 18.38090000,
                longitude: 103.66690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '09:00 - 18:00 น.',
                price: 'เครื่องดื่ม 50-100 บาท'
            },
            {
                id: 107,
                title: 'Mushroom Cafe&Co-working space',
                description: 'คาเฟ่ที่มีพื้นที่ทำงานร่วม เหมาะสำหรับนักเดินทางที่ต้องการทำงาน',
                image: 'คาเฟ่/Mushroom Cafe&Co-working space.png',
                category: 'cafe',
                rating: 4.0,
                latitude: 18.29090000,
                longitude: 103.58690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '08:30 - 18:00 น.',
                price: 'เครื่องดื่ม 50-120 บาท'
            },
            {
                id: 108,
                title: 'นาคีมีมนตร์คาเฟ่ บึงกาฬ',
                description: 'คาเฟ่ที่มีชื่อเสียงในท้องถิ่น บรรยากาศดี เมนูหลากหลาย',
                image: 'คาเฟ่/นาคีมีมนตร์คาเฟ่ บึงกาฬ.png',
                category: 'cafe',
                rating: 4.0,
                latitude: 18.15090000,
                longitude: 103.45690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '07:00 - 17:00 น.',
                price: 'เครื่องดื่ม 50-120 บาท'
            },
            {
                id: 109,
                title: 'รฦก cafe n\' camp',
                description: 'คาเฟ่สไตล์แคมป์ บรรยากาศสบายๆ เหมาะสำหรับการพักผ่อน',
                image: 'คาเฟ่/รฦก cafe n’ camp.png',
                category: 'cafe',
                rating: 3.5,
                latitude: 18.41090000,
                longitude: 103.70690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '08:00 - 18:00 น.',
                price: 'เครื่องดื่ม 40-100 บาท'
            },
            {
                id: 110,
                title: 'โมเดิร์นคาเฟ่ บึงโขงหลง',
                description: 'คาเฟ่สไตล์โมเดิร์น ตกแต่งสวยงาม ใกล้บึงโขงหลง',
                image: 'คาเฟ่/โมเดิร์นคาเฟ่ บึงโขงหลง.png',
                category: 'cafe',
                rating: 4.0,
                latitude: 18.22090000,
                longitude: 103.52690000,
                address: 'อำเภอบึงโขงหลง จังหวัดบึงกาฬ',
                opening_hours: '09:00 - 18:00 น.',
                price: 'เครื่องดื่ม 60-150 บาท'
            }
        ];

        // ข้อมูลที่พัก (ตรงกับ database.sql)
        this.accommodationsData = [
            {
                id: 201,
                title: 'The One Hotel Buengkan',
                description: 'โรงแรมขนาดใหญ่ ทันสมัย สิ่งอำนวยความสะดวกครบครัน ตั้งอยู่ในตัวเมือง',
                image: 'ที่พัก/The One Hotel Buengkan.png',
                category: 'accommodation',
                rating: 4.0,
                latitude: 18.36090000,
                longitude: 103.64690000,
                address: 'ตัวเมืองบึงกาฬ จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '800 - 1,500 บาท/คืน'
            },
            {
                id: 202,
                title: 'BP Grand Hotel',
                description: 'โรงแรมที่พักสะดวกสบาย มีห้องพักหลายประเภท บริการดี',
                image: 'ที่พัก/BP Grand Hotel.png',
                category: 'accommodation',
                rating: 4.0,
                latitude: 18.37090000,
                longitude: 103.65690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '700 - 1,200 บาท/คืน'
            },
            {
                id: 203,
                title: 'B2 Bueng Kan Hotel',
                description: 'โรงแรมสะดวกสบาย ตั้งอยู่ในตัวเมือง เดินทางง่าย',
                image: 'ที่พัก/B2 Bueng Kan Hotel.png',
                category: 'accommodation',
                rating: 4.0,
                latitude: 18.35090000,
                longitude: 103.63690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '900 - 1,800 บาท/คืน'
            },
            {
                id: 204,
                title: 'Maikeaw River View Resort',
                description: 'รีสอร์ทริมแม่น้ำโขง มีห้องพักวิวแม่น้ำ บรรยากาศดี เหมาะแก่การพักผ่อน',
                image: 'ที่พัก/Maikeaw River View Resort.png',
                category: 'accommodation',
                rating: 4.0,
                latitude: 18.34090000,
                longitude: 103.62690000,
                address: 'ริมแม่น้ำโขง จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '1,000 - 2,500 บาท/คืน'
            },
            {
                id: 205,
                title: 'Manee Mekkala Hotel',
                description: 'โรงแรมขนาดเล็ก ราคาประหยัด สะอาด สิ่งอำนวยความสะดวกพื้นฐานครบครัน',
                image: 'ที่พัก/Manee Mekkala Hotel.png',
                category: 'accommodation',
                rating: 3.0,
                latitude: 18.33090000,
                longitude: 103.61690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '500 - 800 บาท/คืน'
            },
            {
                id: 206,
                title: 'Baan Rimkhong Hotel',
                description: 'โรงแรมริมแม่น้ำโขง บรรยากาศสบายๆ มีห้องพักวิวแม่น้ำบางส่วน',
                image: 'ที่พัก/Baan Rimkhong Hotel.png',
                category: 'accommodation',
                rating: 3.0,
                latitude: 18.38090000,
                longitude: 103.66690000,
                address: 'ริมแม่น้ำโขง จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '600 - 1,000 บาท/คืน'
            },
            {
                id: 207,
                title: 'The Rich Hotel',
                description: 'โรงแรมที่พักสะดวกสบายในตัวเมืองบึงกาฬ ห้องพักสะอาด',
                image: 'ที่พัก/The Rich Hotel.png',
                category: 'accommodation',
                rating: 4.0,
                latitude: 18.29090000,
                longitude: 103.58690000,
                address: 'ตัวเมืองบึงกาฬ จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '700 - 1,100 บาท/คืน'
            },
            {
                id: 208,
                title: 'โรงแรมฟ้าใสบึงกาฬ',
                description: 'โรงแรมราคาประหยัด มีห้องพักที่สะอาด เหมาะสำหรับนักเดินทางที่ต้องการความคุ้มค่า',
                image: 'ที่พัก/โรงแรมฟ้าใสบึงกาฬ.png',
                category: 'accommodation',
                rating: 3.0,
                latitude: 18.41090000,
                longitude: 103.70690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '400 - 700 บาท/คืน'
            },
            {
                id: 209,
                title: 'โรงแรมบึงกาฬพาเลซ',
                description: 'โรงแรมเก่าแก่ในตัวเมือง มีห้องพักกว้างขวาง เดินทางสะดวก',
                image: 'ที่พัก/โรงแรมบึงกาฬพาเลซ.png',
                category: 'accommodation',
                rating: 3.0,
                latitude: 18.22090000,
                longitude: 103.52690000,
                address: 'ตัวเมืองบึงกาฬ จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '500 - 900 บาท/คืน'
            },
            {
                id: 210,
                title: 'Zenery Lake Resort',
                description: 'รีสอร์ทริมทะเลสาบ บรรยากาศสงบ เหมาะสำหรับการพักผ่อน',
                image: 'ที่พัก/Zenery Lake Resort.png',
                category: 'accommodation',
                rating: 4.0,
                latitude: 18.15090000,
                longitude: 103.45690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '24 ชั่วโมง',
                price: '800 - 1,500 บาท/คืน'
            }
        ];

        // ข้อมูลร้านอาหาร (ตรงกับ database.sql)
        this.restaurantsData = [
            {
                id: 301,
                title: 'ร้านอาหารริมน้ำบึงกาฬ',
                description: 'ร้านอาหารริมแม่น้ำโขง บรรยากาศดี มีเมนูอาหารไทยและอาหารอีสานหลากหลาย',
                image: 'ร้านอาหาร/ร้านอาหารริมน้ำบึงกาฬ.png',
                category: 'restaurant',
                rating: 4.0,
                latitude: 18.36090000,
                longitude: 103.64690000,
                address: 'ริมแม่น้ำโขง จังหวัดบึงกาฬ',
                opening_hours: '11:00 - 22:00 น.',
                price: '100 - 300 บาท/เมนู'
            },
            {
                id: 302,
                title: 'ร้านลาบเป็ดหนองคาย',
                description: 'ร้านอาหารอีสานขึ้นชื่อ โดยเฉพาะเมนูลาบเป็ดรสเด็ด',
                image: 'ร้านอาหาร/ร้านลาบเป็ดหนองคาย.png',
                category: 'restaurant',
                rating: 4.0,
                latitude: 18.37090000,
                longitude: 103.65690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '09:00 - 20:00 น.',
                price: '80 - 200 บาท/เมนู'
            },
            {
                id: 303,
                title: 'ร้านอาหารครัวบ้านป่า',
                description: 'ร้านอาหารไทยและอีสาน บรรยากาศสบายๆ เป็นกันเอง มีเมนูให้เลือกมากมาย',
                image: 'ร้านอาหาร/ร้านอาหารครัวบ้านป่า.png',
                category: 'restaurant',
                rating: 3.0,
                latitude: 18.35090000,
                longitude: 103.63690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '10:00 - 21:00 น.',
                price: '90 - 250 บาท/เมนู'
            },
            {
                id: 304,
                title: 'ร้านอาหารสมบัติโภชนา',
                description: 'ร้านอาหารไทย-จีน เก่าแก่ในบึงกาฬ มีเมนูหลากหลาย ทั้งอาหารทะเลและอาหารพื้นบ้าน',
                image: 'ร้านอาหาร/ร้านอาหารสมบัติโภชนา.png',
                category: 'restaurant',
                rating: 4.0,
                latitude: 18.34090000,
                longitude: 103.62690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '11:00 - 22:00 น.',
                price: '120 - 400 บาท/เมนู'
            },
            {
                id: 305,
                title: 'ร้านอาหารเวียงจันทน์',
                description: 'ร้านอาหารเวียดนามชื่อดังในบึงกาฬ มีเมนูแหนมเนือง ปอเปี๊ยะสด และอื่นๆ',
                image: 'ร้านอาหาร/ร้านอาหารเวียงจันทน์.png',
                category: 'restaurant',
                rating: 4.0,
                latitude: 18.33090000,
                longitude: 103.61690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '08:00 - 19:00 น.',
                price: '60 - 180 บาท/เมนู'
            },
            {
                id: 306,
                title: 'ร้านอาหารครัวบึงกาฬ',
                description: 'ร้านอาหารท้องถิ่นที่มีเมนูอีสานและอาหารไทยหลากหลาย บรรยากาศเป็นกันเอง',
                image: 'ร้านอาหาร/ร้านอาหารครัวบึงกาฬ.png',
                category: 'restaurant',
                rating: 3.0,
                latitude: 18.38090000,
                longitude: 103.66690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '10:00 - 21:00 น.',
                price: '80 - 220 บาท/เมนู'
            },
            {
                id: 307,
                title: 'ร้านอาหารต้นตาล',
                description: 'ร้านอาหารบรรยากาศสวน นั่งสบาย มีเมนูอาหารไทยและอีสาน',
                image: 'ร้านอาหาร/ร้านอาหารต้นตาล.png',
                category: 'restaurant',
                rating: 3.0,
                latitude: 18.29090000,
                longitude: 103.58690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '10:00 - 21:00 น.',
                price: '90 - 250 บาท/เมนู'
            },
            {
                id: 308,
                title: 'ร้านอาหารเจ๊รัช (ริมโขง)',
                description: 'ร้านอาหารริมโขง เน้นอาหารอีสานและอาหารพื้นบ้าน เมนูปลาแม่น้ำสดๆ',
                image: 'ร้านอาหาร/ร้านอาหารเจ๊รัช (ริมโขง).png',
                category: 'restaurant',
                rating: 4.0,
                latitude: 18.41090000,
                longitude: 103.70690000,
                address: 'ริมแม่น้ำโขง จังหวัดบึงกาฬ',
                opening_hours: '10:00 - 20:00 น.',
                price: '100 - 300 บาท/เมนู'
            },
            {
                id: 309,
                title: 'ร้านก๋วยจั๊บญวนอุดร (บึงกาฬ)',
                description: 'ร้านก๋วยจั๊บญวนชื่อดัง รสชาติต้นตำรับ เครื่องแน่น',
                image: 'ร้านอาหาร/ร้านก๋วยจั๊บญวนอุดร (บึงกาฬ).png',
                category: 'restaurant',
                rating: 4.0,
                latitude: 18.22090000,
                longitude: 103.52690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '06:00 - 15:00 น.',
                price: '50 - 80 บาท/ชาม'
            },
            {
                id: 310,
                title: 'ตลาดโต้รุ่งบึงกาฬ (โซนอาหาร)',
                description: 'ศูนย์รวมร้านอาหารหลากหลายประเภท ทั้งอาหารตามสั่ง อาหารอีสาน สตรีทฟู้ด',
                image: 'ร้านอาหาร/ตลาดโต้รุ่งบึงกาฬ (โซนอาหาร).png',
                category: 'restaurant',
                rating: 3.0,
                latitude: 18.15090000,
                longitude: 103.45690000,
                address: 'จังหวัดบึงกาฬ',
                opening_hours: '17:00 - 23:00 น.',
                price: '40 - 150 บาท/เมนู'
            }
        ];
    }

    async getAttractions() {
        if (this.cache.has('attractions')) {
            return this.cache.get('attractions');
        }
        this.cache.set('attractions', this.attractionsData);
        return this.attractionsData;
    }

    async getCafes() {
        if (this.cache.has('cafes')) {
            return this.cache.get('cafes');
        }
        this.cache.set('cafes', this.cafesData);
        return this.cafesData;
    }

    async getAccommodations() {
        if (this.cache.has('accommodations')) {
            return this.cache.get('accommodations');
        }
        this.cache.set('accommodations', this.accommodationsData);
        return this.accommodationsData;
    }

    async getRestaurants() {
        if (this.cache.has('restaurants')) {
            return this.cache.get('restaurants');
        }
        this.cache.set('restaurants', this.restaurantsData);
        return this.restaurantsData;
    }
}

const buengkanAPI = new BuengkanAPI();