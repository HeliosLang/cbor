import { deepEqual, strictEqual, throws } from "node:assert"
import { describe, it } from "node:test"
import { hexToBytes, makeByteStream } from "@helios-lang/codec-utils"
import { encodeInt } from "./int.js"
import { decodeString, encodeString, isString } from "./string.js"

describe(isString.name, () => {
    it("returns true for [0x60]", () => {
        strictEqual(isString([0x60]), true)
    })

    it("returns false for [0]", () => {
        strictEqual(isString([0]), false)
    })

    it("fails for []", () => {
        throws(() => isString([]))
    })

    it("doesn't change stream pos", () => {
        const stream = makeByteStream([0x60])

        strictEqual(isString(stream), true)
        strictEqual(stream.pos, 0)
    })

    it("doesn't change stream pos if not a string", () => {
        const stream = makeByteStream(encodeInt(0))

        strictEqual(isString(stream), false)
        strictEqual(stream.pos, 0)
    })
})

describe(decodeString.name, () => {
    it('returns "" for [0x60]', () => {
        strictEqual(decodeString([0x60]), "")
    })

    it('returns "a" for [0x61, 0x61]', () => {
        strictEqual(decodeString([0x61, 0x61]), "a")
    })

    it('returns "IETF" for #6449455446', () => {
        strictEqual(decodeString(hexToBytes("6449455446")), "IETF")
    })

    it('returns ""\\" for #62225c', () => {
        strictEqual(decodeString(hexToBytes("62225c")), '"\\')
    })

    it('returns "ü" for #62c3bc', () => {
        strictEqual(decodeString(hexToBytes("62c3bc")), "ü")
    })

    it('returns "水" for #63e6b0b4', () => {
        strictEqual(decodeString(hexToBytes("63e6b0b4")), "水")
    })

    it('returns "𐅑" for #64f0908591', () => {
        strictEqual(decodeString(hexToBytes("64f0908591")), "𐅑")
    })

    it("fails for []", () => {
        throws(() => decodeString([]))
    })

    it("fails for [0]", () => {
        throws(() => decodeString([0]))
    })
})

describe(encodeString.name, () => {
    it('returns [0x60] for ""', () => {
        deepEqual(encodeString(""), [0x60])
    })

    it('returns [0x61, 0x61] for "a"', () => {
        deepEqual(encodeString("a"), [0x61, 0x61])
    })

    it('returns #6449455446 for "IETF"', () => {
        deepEqual(encodeString("IETF"), hexToBytes("6449455446"))
    })
})

describe(`${encodeString.name}/${decodeString.name} roundtrip`, () => {
    const testVector = [
        "天",
        "地玄",
        "黃宇宙",
        "洪荒。蓋",
        "此身髮四大",
        "五常。都邑華",
        "夏東西二京。治",
        "本於農務茲稼穡。",
        "耽讀玩市寓目囊箱。",
        "布射僚丸嵇琴阮嘯。日",
        "月盈昃辰宿列張。恭惟鞠",
        "養豈敢毀傷。背邙面洛浮渭",
        "據涇。俶載南畝我藝黍稷。易",
        "輶攸畏屬耳垣牆。恬筆倫紙鈞巧",
        "任釣。寒來暑往，秋收冬藏。女慕",
        "貞絜男效才良。宮殿盤郁樓觀飛驚。稅",
        "熟貢新勸賞黜陟。具膳餐飯適口充腸。釋",
        "紛利俗竝皆佳妙。閏餘成歲律呂調陽。知過",
        "必改得能莫忘。圖寫禽獸畫彩仙靈。孟軻敦素",
        "史魚秉直。飽飫烹宰飢厭糟糠。毛施淑姿工顰妍",
        "笑。雲騰致雨露結為霜。罔談彼短靡恃己長。丙舍",
        "傍啟甲帳對楹。庶幾中庸勞謙謹敕。親戚故舊老少異",
        "糧。年矢每催曦暉朗曜。金生麗水玉出崑岡。信使可覆",
        "器欲難量。肆筵設席鼓瑟吹笙。聆音察理鑒貌辨色。妾御",
        "績紡侍巾帷房。璿璣懸斡晦魄環照。劍號巨闕珠稱夜光。墨",
        "悲絲染詩讚羔羊。升階納陛弁轉疑星。貽厥嘉猷勉其祗植。紈",
        "扇圓潔銀燭煒煌。指薪修祜永綏吉劭。果珍李柰菜重芥薑。景行",
        "維賢克念作聖。右通廣內左達承明。省躬譏誡寵增抗極。晝眠夕寐",
        "藍筍象床。矩步引領俯仰廊廟。海鹹河淡，鱗潛羽翔。德建名立形端",
        "表正。既集墳典亦聚群英。殆辱近恥林皋幸即。弦歌酒宴接杯舉觴。束",
        "帶矜庄徘徊瞻眺。空谷傳聲虛堂習聽。杜稿鍾隸漆書壁經。兩疏見機解組",
        "誰逼。矯手頓足，悅豫且康。孤陋寡聞，愚蒙等誚。龍師火帝，鳥官人皇。",
        " 禍因惡積，福緣善慶。 	府羅將相，路俠槐卿。 	索居閒處，沉默寂寥。",
        "嫡後嗣續，祭祀烝嘗。 	謂語助者，焉哉乎也。       始製文字，乃服衣裳",
        "尺璧非寶，寸陰是競。 	戶封八縣，家給千兵。 	求古尋論，散慮逍遙。稽顙",
        "再拜，悚懼恐惶。 	       推位讓國，有虞陶唐。 	資父事君，曰嚴與敬。",
        " 	高冠陪輦，驅轂振纓。 	欣奏累遣，慼謝歡招。 	箋牒簡要，顧答審詳。  ",
        "弔民伐罪，周發殷湯。 	孝當竭力，忠則盡命。 	世祿侈富，車駕肥輕。 	渠荷",
        "的歷，園莽抽條。 	骸垢想浴，執熱願涼。 	        坐朝問道，垂拱平章。 	",
        "臨深履薄，夙興溫凊。 	策功茂實，勒碑刻銘。 	枇杷晚翠，梧桐蚤凋。 	驢騾犢特",
        "，駭躍超驤。 	愛育黎首，臣伏戎羌。 	似蘭斯馨，如松之盛。 	磻溪伊尹，佐時阿衡",
        "。 	陳根委翳，落葉飄搖。 	誅斬賊盜，捕獲叛亡。 	      遐邇一體，率賓歸王。",
        " 	川流不息，淵澄取映。 	奄宅曲阜，微旦孰營。 	遊鵾獨運，凌摩絳霄。 		   ",
        "    鳴鳳在竹，白駒食場。 	容止若思，言辭安定。 	桓公匡合，濟弱扶傾。    化被草木，",
        "賴及萬方。 	篤初誠美，慎終宜令。 	綺回漢惠，說感武丁。榮業所基，藉甚無竟。 	俊乂",
        "密勿，多士寔寧。 			        學優登仕，攝職從政。 	晉楚更霸，趙魏困橫。     存",
        "以甘棠，去而益詠。 	假途滅虢，踐土會盟。 			         樂殊貴賤，禮別尊卑。 	",
        "何遵約法，韓弊煩刑。 			          上和下睦，夫唱婦隨。 	起翦頗牧，用軍最精。 	  ",
        "           外受傅訓，入奉母儀。 	宣威沙漠，馳譽丹青。 			          諸姑伯叔，猶",
        "子比兒。 	九州禹跡，百郡秦并。 			          孔懷兄弟，同氣連枝。 	岳宗泰岱，禪主云亭",
        "。 			         交友投分，切磨箴規。 	雁門紫塞，雞田赤城。          仁慈隱惻，造次弗",
        "離。 	昆池碣石，鉅野洞庭。 			       節義廉退，顛沛匪虧。 	曠遠綿邈，岩岫杳冥。    ",
        "性靜情逸，心動神疲。            守真志滿，逐物意移。                       堅持雅操，好爵自縻。"
    ]

    testVector.forEach((v, i) => {
        const split = i % 2 == 0

        it(`ok for "${v}" with split=${split}`, () => {
            strictEqual(decodeString(encodeString(v, split)), v)
        })
    })
})
