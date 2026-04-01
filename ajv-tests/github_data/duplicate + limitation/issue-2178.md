# [2178] Maximum call stack size exceeded exception has been thrown when compiling the validate function from the schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? 8.11.0**

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ coerceTypes: 'array', allErrors: false }
```

**JSON Schema**


<!-- Please make it as small as possible to reproduce the issue -->

```json
{"$schema":"http://json-schema.org/draft-07/schema","description":"This JSON-schema was automatically generated from XML by Data Model Service","type":"object","properties":{"test0":{"type":"string"},"test1":{"type":"string"},"test2":{"type":"string"},"test3":{"type":"string"},"test4":{"type":"string"},"test5":{"type":"string"},"test6":{"type":"string"},"test7":{"type":"string"},"test8":{"type":"string"},"test9":{"type":"string"},"test10":{"type":"string"},"test11":{"type":"string"},"test12":{"type":"string"},"test13":{"type":"string"},"test14":{"type":"string"},"test15":{"type":"string"},"test16":{"type":"string"},"test17":{"type":"string"},"test18":{"type":"string"},"test19":{"type":"string"},"test20":{"type":"string"},"test21":{"type":"string"},"test22":{"type":"string"},"test23":{"type":"string"},"test24":{"type":"string"},"test25":{"type":"string"},"test26":{"type":"string"},"test27":{"type":"string"},"test28":{"type":"string"},"test29":{"type":"string"},"test30":{"type":"string"},"test31":{"type":"string"},"test32":{"type":"string"},"test33":{"type":"string"},"test34":{"type":"string"},"test35":{"type":"string"},"test36":{"type":"string"},"test37":{"type":"string"},"test38":{"type":"string"},"test39":{"type":"string"},"test40":{"type":"string"},"test41":{"type":"string"},"test42":{"type":"string"},"test43":{"type":"string"},"test44":{"type":"string"},"test45":{"type":"string"},"test46":{"type":"string"},"test47":{"type":"string"},"test48":{"type":"string"},"test49":{"type":"string"},"test50":{"type":"string"},"test51":{"type":"string"},"test52":{"type":"string"},"test53":{"type":"string"},"test54":{"type":"string"},"test55":{"type":"string"},"test56":{"type":"string"},"test57":{"type":"string"},"test58":{"type":"string"},"test59":{"type":"string"},"test60":{"type":"string"},"test61":{"type":"string"},"test62":{"type":"string"},"test63":{"type":"string"},"test64":{"type":"string"},"test65":{"type":"string"},"test66":{"type":"string"},"test67":{"type":"string"},"test68":{"type":"string"},"test69":{"type":"string"},"test70":{"type":"string"},"test71":{"type":"string"},"test72":{"type":"string"},"test73":{"type":"string"},"test74":{"type":"string"},"test75":{"type":"string"},"test76":{"type":"string"},"test77":{"type":"string"},"test78":{"type":"string"},"test79":{"type":"string"},"test80":{"type":"string"},"test81":{"type":"string"},"test82":{"type":"string"},"test83":{"type":"string"},"test84":{"type":"string"},"test85":{"type":"string"},"test86":{"type":"string"},"test87":{"type":"string"},"test88":{"type":"string"},"test89":{"type":"string"},"test90":{"type":"string"},"test91":{"type":"string"},"test92":{"type":"string"},"test93":{"type":"string"},"test94":{"type":"string"},"test95":{"type":"string"},"test96":{"type":"string"},"test97":{"type":"string"},"test98":{"type":"string"},"test99":{"type":"string"},"test100":{"type":"string"},"test101":{"type":"string"},"test102":{"type":"string"},"test103":{"type":"string"},"test104":{"type":"string"},"test105":{"type":"string"},"test106":{"type":"string"},"test107":{"type":"string"},"test108":{"type":"string"},"test109":{"type":"string"},"test110":{"type":"string"},"test111":{"type":"string"},"test112":{"type":"string"},"test113":{"type":"string"},"test114":{"type":"string"},"test115":{"type":"string"},"test116":{"type":"string"},"test117":{"type":"string"},"test118":{"type":"string"},"test119":{"type":"string"},"test120":{"type":"string"},"test121":{"type":"string"},"test122":{"type":"string"},"test123":{"type":"string"},"test124":{"type":"string"},"test125":{"type":"string"},"test126":{"type":"string"},"test127":{"type":"string"},"test128":{"type":"string"},"test129":{"type":"string"},"test130":{"type":"string"},"test131":{"type":"string"},"test132":{"type":"string"},"test133":{"type":"string"},"test134":{"type":"string"},"test135":{"type":"string"},"test136":{"type":"string"},"test137":{"type":"string"},"test138":{"type":"string"},"test139":{"type":"string"},"test140":{"type":"string"},"test141":{"type":"string"},"test142":{"type":"string"},"test143":{"type":"string"},"test144":{"type":"string"},"test145":{"type":"string"},"test146":{"type":"string"},"test147":{"type":"string"},"test148":{"type":"string"},"test149":{"type":"string"},"test150":{"type":"string"},"test151":{"type":"string"},"test152":{"type":"string"},"test153":{"type":"string"},"test154":{"type":"string"},"test155":{"type":"string"},"test156":{"type":"string"},"test157":{"type":"string"},"test158":{"type":"string"},"test159":{"type":"string"},"test160":{"type":"string"},"test161":{"type":"string"},"test162":{"type":"string"},"test163":{"type":"string"},"test164":{"type":"string"},"test165":{"type":"string"},"test166":{"type":"string"},"test167":{"type":"string"},"test168":{"type":"string"},"test169":{"type":"string"},"test170":{"type":"string"},"test171":{"type":"string"},"test172":{"type":"string"},"test173":{"type":"string"},"test174":{"type":"string"},"test175":{"type":"string"},"test176":{"type":"string"},"test177":{"type":"string"},"test178":{"type":"string"},"test179":{"type":"string"},"test180":{"type":"string"},"test181":{"type":"string"},"test182":{"type":"string"},"test183":{"type":"string"},"test184":{"type":"string"},"test185":{"type":"string"},"test186":{"type":"string"},"test187":{"type":"string"},"test188":{"type":"string"},"test189":{"type":"string"},"test190":{"type":"string"},"test191":{"type":"string"},"test192":{"type":"string"},"test193":{"type":"string"},"test194":{"type":"string"},"test195":{"type":"string"},"test196":{"type":"string"},"test197":{"type":"string"},"test198":{"type":"string"},"test199":{"type":"string"},"test200":{"type":"string"},"test201":{"type":"string"},"test202":{"type":"string"},"test203":{"type":"string"},"test204":{"type":"string"},"test205":{"type":"string"},"test206":{"type":"string"},"test207":{"type":"string"},"test208":{"type":"string"},"test209":{"type":"string"},"test210":{"type":"string"},"test211":{"type":"string"},"test212":{"type":"string"},"test213":{"type":"string"},"test214":{"type":"string"},"test215":{"type":"string"},"test216":{"type":"string"},"test217":{"type":"string"},"test218":{"type":"string"},"test219":{"type":"string"},"test220":{"type":"string"},"test221":{"type":"string"},"test222":{"type":"string"},"test223":{"type":"string"},"test224":{"type":"string"},"test225":{"type":"string"},"test226":{"type":"string"},"test227":{"type":"string"},"test228":{"type":"string"},"test229":{"type":"string"},"test230":{"type":"string"},"test231":{"type":"string"},"test232":{"type":"string"},"test233":{"type":"string"},"test234":{"type":"string"},"test235":{"type":"string"},"test236":{"type":"string"},"test237":{"type":"string"},"test238":{"type":"string"},"test239":{"type":"string"},"test240":{"type":"string"},"test241":{"type":"string"},"test242":{"type":"string"},"test243":{"type":"string"},"test244":{"type":"string"},"test245":{"type":"string"},"test246":{"type":"string"},"test247":{"type":"string"},"test248":{"type":"string"},"test249":{"type":"string"},"test250":{"type":"string"},"test251":{"type":"string"},"test252":{"type":"string"},"test253":{"type":"string"},"test254":{"type":"string"},"test255":{"type":"string"},"test256":{"type":"string"},"test257":{"type":"string"},"test258":{"type":"string"},"test259":{"type":"string"},"test260":{"type":"string"},"test261":{"type":"string"},"test262":{"type":"string"},"test263":{"type":"string"},"test264":{"type":"string"},"test265":{"type":"string"},"test266":{"type":"string"},"test267":{"type":"string"},"test268":{"type":"string"},"test269":{"type":"string"},"test270":{"type":"string"},"test271":{"type":"string"},"test272":{"type":"string"},"test273":{"type":"string"},"test274":{"type":"string"},"test275":{"type":"string"},"test276":{"type":"string"},"test277":{"type":"string"},"test278":{"type":"string"},"test279":{"type":"string"},"test280":{"type":"string"},"test281":{"type":"string"},"test282":{"type":"string"},"test283":{"type":"string"},"test284":{"type":"string"},"test285":{"type":"string"},"test286":{"type":"string"},"test287":{"type":"string"},"test288":{"type":"string"},"test289":{"type":"string"},"test290":{"type":"string"},"test291":{"type":"string"},"test292":{"type":"string"},"test293":{"type":"string"},"test294":{"type":"string"},"test295":{"type":"string"},"test296":{"type":"string"},"test297":{"type":"string"},"test298":{"type":"string"},"test299":{"type":"string"},"test300":{"type":"string"},"test301":{"type":"string"},"test302":{"type":"string"},"test303":{"type":"string"},"test304":{"type":"string"},"test305":{"type":"string"},"test306":{"type":"string"},"test307":{"type":"string"},"test308":{"type":"string"},"test309":{"type":"string"},"test310":{"type":"string"},"test311":{"type":"string"},"test312":{"type":"string"},"test313":{"type":"string"},"test314":{"type":"string"},"test315":{"type":"string"},"test316":{"type":"string"},"test317":{"type":"string"},"test318":{"type":"string"},"test319":{"type":"string"},"test320":{"type":"string"},"test321":{"type":"string"},"test322":{"type":"string"},"test323":{"type":"string"},"test324":{"type":"string"},"test325":{"type":"string"},"test326":{"type":"string"},"test327":{"type":"string"},"test328":{"type":"string"},"test329":{"type":"string"},"test330":{"type":"string"},"test331":{"type":"string"},"test332":{"type":"string"},"test333":{"type":"string"},"test334":{"type":"string"},"test335":{"type":"string"},"test336":{"type":"string"},"test337":{"type":"string"},"test338":{"type":"string"},"test339":{"type":"string"},"test340":{"type":"string"},"test341":{"type":"string"},"test342":{"type":"string"},"test343":{"type":"string"},"test344":{"type":"string"},"test345":{"type":"string"},"test346":{"type":"string"},"test347":{"type":"string"},"test348":{"type":"string"},"test349":{"type":"string"},"test350":{"type":"string"},"test351":{"type":"string"},"test352":{"type":"string"},"test353":{"type":"string"},"test354":{"type":"string"},"test355":{"type":"string"},"test356":{"type":"string"},"test357":{"type":"string"},"test358":{"type":"string"},"test359":{"type":"string"},"test360":{"type":"string"},"test361":{"type":"string"},"test362":{"type":"string"},"test363":{"type":"string"},"test364":{"type":"string"},"test365":{"type":"string"},"test366":{"type":"string"},"test367":{"type":"string"},"test368":{"type":"string"},"test369":{"type":"string"},"test370":{"type":"string"},"test371":{"type":"string"},"test372":{"type":"string"},"test373":{"type":"string"},"test374":{"type":"string"},"test375":{"type":"string"},"test376":{"type":"string"},"test377":{"type":"string"},"test378":{"type":"string"},"test379":{"type":"string"},"test380":{"type":"string"},"test381":{"type":"string"},"test382":{"type":"string"},"test383":{"type":"string"},"test384":{"type":"string"},"test385":{"type":"string"},"test386":{"type":"string"},"test387":{"type":"string"},"test388":{"type":"string"},"test389":{"type":"string"},"test390":{"type":"string"},"test391":{"type":"string"},"test392":{"type":"string"},"test393":{"type":"string"},"test394":{"type":"string"},"test395":{"type":"string"},"test396":{"type":"string"},"test397":{"type":"string"},"test398":{"type":"string"},"test399":{"type":"string"},"test400":{"type":"string"},"test401":{"type":"string"},"test402":{"type":"string"},"test403":{"type":"string"},"test404":{"type":"string"},"test405":{"type":"string"},"test406":{"type":"string"},"test407":{"type":"string"},"test408":{"type":"string"},"test409":{"type":"string"},"test410":{"type":"string"},"test411":{"type":"string"},"test412":{"type":"string"},"test413":{"type":"string"},"test414":{"type":"string"},"test415":{"type":"string"},"test416":{"type":"string"},"test417":{"type":"string"},"test418":{"type":"string"},"test419":{"type":"string"},"test420":{"type":"string"},"test421":{"type":"string"},"test422":{"type":"string"},"test423":{"type":"string"},"test424":{"type":"string"},"test425":{"type":"string"},"test426":{"type":"string"},"test427":{"type":"string"},"test428":{"type":"string"},"test429":{"type":"string"},"test430":{"type":"string"},"test431":{"type":"string"},"test432":{"type":"string"},"test433":{"type":"string"},"test434":{"type":"string"},"test435":{"type":"string"},"test436":{"type":"string"},"test437":{"type":"string"},"test438":{"type":"string"},"test439":{"type":"string"},"test440":{"type":"string"},"test441":{"type":"string"},"test442":{"type":"string"},"test443":{"type":"string"},"test444":{"type":"string"},"test445":{"type":"string"},"test446":{"type":"string"},"test447":{"type":"string"},"test448":{"type":"string"},"test449":{"type":"string"},"test450":{"type":"string"},"test451":{"type":"string"},"test452":{"type":"string"},"test453":{"type":"string"},"test454":{"type":"string"},"test455":{"type":"string"},"test456":{"type":"string"},"test457":{"type":"string"},"test458":{"type":"string"},"test459":{"type":"string"},"test460":{"type":"string"},"test461":{"type":"string"},"test462":{"type":"string"},"test463":{"type":"string"},"test464":{"type":"string"},"test465":{"type":"string"},"test466":{"type":"string"},"test467":{"type":"string"},"test468":{"type":"string"},"test469":{"type":"string"},"test470":{"type":"string"},"test471":{"type":"string"},"test472":{"type":"string"},"test473":{"type":"string"},"test474":{"type":"string"},"test475":{"type":"string"},"test476":{"type":"string"},"test477":{"type":"string"},"test478":{"type":"string"},"test479":{"type":"string"},"test480":{"type":"string"},"test481":{"type":"string"},"test482":{"type":"string"},"test483":{"type":"string"},"test484":{"type":"string"},"test485":{"type":"string"},"test486":{"type":"string"},"test487":{"type":"string"},"test488":{"type":"string"},"test489":{"type":"string"},"test490":{"type":"string"},"test491":{"type":"string"},"test492":{"type":"string"},"test493":{"type":"string"},"test494":{"type":"string"},"test495":{"type":"string"},"test496":{"type":"string"},"test497":{"type":"string"},"test498":{"type":"string"},"test499":{"type":"string"},"test500":{"type":"string"},"test501":{"type":"string"},"test502":{"type":"string"},"test503":{"type":"string"},"test504":{"type":"string"},"test505":{"type":"string"},"test506":{"type":"string"},"test507":{"type":"string"},"test508":{"type":"string"},"test509":{"type":"string"},"test510":{"type":"string"},"test511":{"type":"string"},"test512":{"type":"string"},"test513":{"type":"string"},"test514":{"type":"string"},"test515":{"type":"string"},"test516":{"type":"string"},"test517":{"type":"string"},"test518":{"type":"string"},"test519":{"type":"string"},"test520":{"type":"string"},"test521":{"type":"string"},"test522":{"type":"string"},"test523":{"type":"string"},"test524":{"type":"string"},"test525":{"type":"string"},"test526":{"type":"string"},"test527":{"type":"string"},"test528":{"type":"string"},"test529":{"type":"string"},"test530":{"type":"string"},"test531":{"type":"string"},"test532":{"type":"string"},"test533":{"type":"string"},"test534":{"type":"string"},"test535":{"type":"string"},"test536":{"type":"string"},"test537":{"type":"string"},"test538":{"type":"string"},"test539":{"type":"string"},"test540":{"type":"string"},"test541":{"type":"string"},"test542":{"type":"string"},"test543":{"type":"string"},"test544":{"type":"string"},"test545":{"type":"string"},"test546":{"type":"string"},"test547":{"type":"string"},"test548":{"type":"string"},"test549":{"type":"string"},"test550":{"type":"string"},"test551":{"type":"string"},"test552":{"type":"string"},"test553":{"type":"string"},"test554":{"type":"string"},"test555":{"type":"string"},"test556":{"type":"string"},"test557":{"type":"string"},"test558":{"type":"string"},"test559":{"type":"string"},"test560":{"type":"string"},"test561":{"type":"string"},"test562":{"type":"string"},"test563":{"type":"string"},"test564":{"type":"string"},"test565":{"type":"string"},"test566":{"type":"string"},"test567":{"type":"string"},"test568":{"type":"string"},"test569":{"type":"string"},"test570":{"type":"string"},"test571":{"type":"string"},"test572":{"type":"string"},"test573":{"type":"string"},"test574":{"type":"string"},"test575":{"type":"string"},"test576":{"type":"string"},"test577":{"type":"string"},"test578":{"type":"string"},"test579":{"type":"string"},"test580":{"type":"string"},"test581":{"type":"string"},"test582":{"type":"string"},"test583":{"type":"string"},"test584":{"type":"string"},"test585":{"type":"string"},"test586":{"type":"string"},"test587":{"type":"string"},"test588":{"type":"string"},"test589":{"type":"string"},"test590":{"type":"string"},"test591":{"type":"string"},"test592":{"type":"string"},"test593":{"type":"string"},"test594":{"type":"string"},"test595":{"type":"string"},"test596":{"type":"string"},"test597":{"type":"string"},"test598":{"type":"string"},"test599":{"type":"string"},"test600":{"type":"string"},"test601":{"type":"string"},"test602":{"type":"string"},"test603":{"type":"string"},"test604":{"type":"string"},"test605":{"type":"string"},"test606":{"type":"string"},"test607":{"type":"string"},"test608":{"type":"string"},"test609":{"type":"string"},"test610":{"type":"string"},"test611":{"type":"string"},"test612":{"type":"string"},"test613":{"type":"string"},"test614":{"type":"string"},"test615":{"type":"string"},"test616":{"type":"string"},"test617":{"type":"string"},"test618":{"type":"string"},"test619":{"type":"string"},"test620":{"type":"string"},"test621":{"type":"string"},"test622":{"type":"string"},"test623":{"type":"string"},"test624":{"type":"string"},"test625":{"type":"string"},"test626":{"type":"string"},"test627":{"type":"string"},"test628":{"type":"string"},"test629":{"type":"string"},"test630":{"type":"string"},"test631":{"type":"string"},"test632":{"type":"string"},"test633":{"type":"string"},"test634":{"type":"string"},"test635":{"type":"string"},"test636":{"type":"string"},"test637":{"type":"string"},"test638":{"type":"string"},"test639":{"type":"string"},"test640":{"type":"string"},"test641":{"type":"string"},"test642":{"type":"string"},"test643":{"type":"string"},"test644":{"type":"string"},"test645":{"type":"string"},"test646":{"type":"string"},"test647":{"type":"string"},"test648":{"type":"string"},"test649":{"type":"string"},"test650":{"type":"string"},"test651":{"type":"string"},"test652":{"type":"string"},"test653":{"type":"string"},"test654":{"type":"string"},"test655":{"type":"string"},"test656":{"type":"string"},"test657":{"type":"string"},"test658":{"type":"string"},"test659":{"type":"string"},"test660":{"type":"string"},"test661":{"type":"string"},"test662":{"type":"string"},"test663":{"type":"string"},"test664":{"type":"string"},"test665":{"type":"string"},"test666":{"type":"string"},"test667":{"type":"string"},"test668":{"type":"string"},"test669":{"type":"string"},"test670":{"type":"string"},"test671":{"type":"string"},"test672":{"type":"string"},"test673":{"type":"string"},"test674":{"type":"string"},"test675":{"type":"string"},"test676":{"type":"string"},"test677":{"type":"string"},"test678":{"type":"string"},"test679":{"type":"string"},"test680":{"type":"string"},"test681":{"type":"string"},"test682":{"type":"string"},"test683":{"type":"string"},"test684":{"type":"string"},"test685":{"type":"string"},"test686":{"type":"string"},"test687":{"type":"string"},"test688":{"type":"string"},"test689":{"type":"string"},"test690":{"type":"string"},"test691":{"type":"string"},"test692":{"type":"string"},"test693":{"type":"string"},"test694":{"type":"string"},"test695":{"type":"string"},"test696":{"type":"string"},"test697":{"type":"string"},"test698":{"type":"string"},"test699":{"type":"string"}}}
```

**Sample data**


<!-- Please make it as small as possible to reproduce the issue -->

```xml
<?xml version="1.0" encoding="UTF-8"?>
<request>
    <test0>abc123</test0>
    <test1>abc123</test1>
    <test2>abc123</test2>
    <test3>abc123</test3>
    <test4>abc123</test4>
    <test5>abc123</test5>
    <test6>abc123</test6>
    <test7>abc123</test7>
    <test8>abc123</test8>
    <test9>abc123</test9>
    <test10>abc123</test10>
    <test11>abc123</test11>
    <test12>abc123</test12>
    <test13>abc123</test13>
    <test14>abc123</test14>
    <test15>abc123</test15>
    <test16>abc123</test16>
    <test17>abc123</test17>
    <test18>abc123</test18>
    <test19>abc123</test19>
    <test20>abc123</test20>
    <test21>abc123</test21>
    <test22>abc123</test22>
    <test23>abc123</test23>
    <test24>abc123</test24>
    <test25>abc123</test25>
    <test26>abc123</test26>
    <test27>abc123</test27>
    <test28>abc123</test28>
    <test29>abc123</test29>
    <test30>abc123</test30>
    <test31>abc123</test31>
    <test32>abc123</test32>
    <test33>abc123</test33>
    <test34>abc123</test34>
    <test35>abc123</test35>
    <test36>abc123</test36>
    <test37>abc123</test37>
    <test38>abc123</test38>
    <test39>abc123</test39>
    <test40>abc123</test40>
    <test41>abc123</test41>
    <test42>abc123</test42>
    <test43>abc123</test43>
    <test44>abc123</test44>
    <test45>abc123</test45>
    <test46>abc123</test46>
    <test47>abc123</test47>
    <test48>abc123</test48>
    <test49>abc123</test49>
    <test50>abc123</test50>
    <test51>abc123</test51>
    <test52>abc123</test52>
    <test53>abc123</test53>
    <test54>abc123</test54>
    <test55>abc123</test55>
    <test56>abc123</test56>
    <test57>abc123</test57>
    <test58>abc123</test58>
    <test59>abc123</test59>
    <test60>abc123</test60>
    <test61>abc123</test61>
    <test62>abc123</test62>
    <test63>abc123</test63>
    <test64>abc123</test64>
    <test65>abc123</test65>
    <test66>abc123</test66>
    <test67>abc123</test67>
    <test68>abc123</test68>
    <test69>abc123</test69>
    <test70>abc123</test70>
    <test71>abc123</test71>
    <test72>abc123</test72>
    <test73>abc123</test73>
    <test74>abc123</test74>
    <test75>abc123</test75>
    <test76>abc123</test76>
    <test77>abc123</test77>
    <test78>abc123</test78>
    <test79>abc123</test79>
    <test80>abc123</test80>
    <test81>abc123</test81>
    <test82>abc123</test82>
    <test83>abc123</test83>
    <test84>abc123</test84>
    <test85>abc123</test85>
    <test86>abc123</test86>
    <test87>abc123</test87>
    <test88>abc123</test88>
    <test89>abc123</test89>
    <test90>abc123</test90>
    <test91>abc123</test91>
    <test92>abc123</test92>
    <test93>abc123</test93>
    <test94>abc123</test94>
    <test95>abc123</test95>
    <test96>abc123</test96>
    <test97>abc123</test97>
    <test98>abc123</test98>
    <test99>abc123</test99>
    <test100>abc123</test100>
    <test101>abc123</test101>
    <test102>abc123</test102>
    <test103>abc123</test103>
    <test104>abc123</test104>
    <test105>abc123</test105>
    <test106>abc123</test106>
    <test107>abc123</test107>
    <test108>abc123</test108>
    <test109>abc123</test109>
    <test110>abc123</test110>
    <test111>abc123</test111>
    <test112>abc123</test112>
    <test113>abc123</test113>
    <test114>abc123</test114>
    <test115>abc123</test115>
    <test116>abc123</test116>
    <test117>abc123</test117>
    <test118>abc123</test118>
    <test119>abc123</test119>
    <test120>abc123</test120>
    <test121>abc123</test121>
    <test122>abc123</test122>
    <test123>abc123</test123>
    <test124>abc123</test124>
    <test125>abc123</test125>
    <test126>abc123</test126>
    <test127>abc123</test127>
    <test128>abc123</test128>
    <test129>abc123</test129>
    <test130>abc123</test130>
    <test131>abc123</test131>
    <test132>abc123</test132>
    <test133>abc123</test133>
    <test134>abc123</test134>
    <test135>abc123</test135>
    <test136>abc123</test136>
    <test137>abc123</test137>
    <test138>abc123</test138>
    <test139>abc123</test139>
    <test140>abc123</test140>
    <test141>abc123</test141>
    <test142>abc123</test142>
    <test143>abc123</test143>
    <test144>abc123</test144>
    <test145>abc123</test145>
    <test146>abc123</test146>
    <test147>abc123</test147>
    <test148>abc123</test148>
    <test149>abc123</test149>
    <test150>abc123</test150>
    <test151>abc123</test151>
    <test152>abc123</test152>
    <test153>abc123</test153>
    <test154>abc123</test154>
    <test155>abc123</test155>
    <test156>abc123</test156>
    <test157>abc123</test157>
    <test158>abc123</test158>
    <test159>abc123</test159>
    <test160>abc123</test160>
    <test161>abc123</test161>
    <test162>abc123</test162>
    <test163>abc123</test163>
    <test164>abc123</test164>
    <test165>abc123</test165>
    <test166>abc123</test166>
    <test167>abc123</test167>
    <test168>abc123</test168>
    <test169>abc123</test169>
    <test170>abc123</test170>
    <test171>abc123</test171>
    <test172>abc123</test172>
    <test173>abc123</test173>
    <test174>abc123</test174>
    <test175>abc123</test175>
    <test176>abc123</test176>
    <test177>abc123</test177>
    <test178>abc123</test178>
    <test179>abc123</test179>
    <test180>abc123</test180>
    <test181>abc123</test181>
    <test182>abc123</test182>
    <test183>abc123</test183>
    <test184>abc123</test184>
    <test185>abc123</test185>
    <test186>abc123</test186>
    <test187>abc123</test187>
    <test188>abc123</test188>
    <test189>abc123</test189>
    <test190>abc123</test190>
    <test191>abc123</test191>
    <test192>abc123</test192>
    <test193>abc123</test193>
    <test194>abc123</test194>
    <test195>abc123</test195>
    <test196>abc123</test196>
    <test197>abc123</test197>
    <test198>abc123</test198>
    <test199>abc123</test199>
    <test200>abc123</test200>
    <test201>abc123</test201>
    <test202>abc123</test202>
    <test203>abc123</test203>
    <test204>abc123</test204>
    <test205>abc123</test205>
    <test206>abc123</test206>
    <test207>abc123</test207>
    <test208>abc123</test208>
    <test209>abc123</test209>
    <test210>abc123</test210>
    <test211>abc123</test211>
    <test212>abc123</test212>
    <test213>abc123</test213>
    <test214>abc123</test214>
    <test215>abc123</test215>
    <test216>abc123</test216>
    <test217>abc123</test217>
    <test218>abc123</test218>
    <test219>abc123</test219>
    <test220>abc123</test220>
    <test221>abc123</test221>
    <test222>abc123</test222>
    <test223>abc123</test223>
    <test224>abc123</test224>
    <test225>abc123</test225>
    <test226>abc123</test226>
    <test227>abc123</test227>
    <test228>abc123</test228>
    <test229>abc123</test229>
    <test230>abc123</test230>
    <test231>abc123</test231>
    <test232>abc123</test232>
    <test233>abc123</test233>
    <test234>abc123</test234>
    <test235>abc123</test235>
    <test236>abc123</test236>
    <test237>abc123</test237>
    <test238>abc123</test238>
    <test239>abc123</test239>
    <test240>abc123</test240>
    <test241>abc123</test241>
    <test242>abc123</test242>
    <test243>abc123</test243>
    <test244>abc123</test244>
    <test245>abc123</test245>
    <test246>abc123</test246>
    <test247>abc123</test247>
    <test248>abc123</test248>
    <test249>abc123</test249>
    <test250>abc123</test250>
    <test251>abc123</test251>
    <test252>abc123</test252>
    <test253>abc123</test253>
    <test254>abc123</test254>
    <test255>abc123</test255>
    <test256>abc123</test256>
    <test257>abc123</test257>
    <test258>abc123</test258>
    <test259>abc123</test259>
    <test260>abc123</test260>
    <test261>abc123</test261>
    <test262>abc123</test262>
    <test263>abc123</test263>
    <test264>abc123</test264>
    <test265>abc123</test265>
    <test266>abc123</test266>
    <test267>abc123</test267>
    <test268>abc123</test268>
    <test269>abc123</test269>
    <test270>abc123</test270>
    <test271>abc123</test271>
    <test272>abc123</test272>
    <test273>abc123</test273>
    <test274>abc123</test274>
    <test275>abc123</test275>
    <test276>abc123</test276>
    <test277>abc123</test277>
    <test278>abc123</test278>
    <test279>abc123</test279>
    <test280>abc123</test280>
    <test281>abc123</test281>
    <test282>abc123</test282>
    <test283>abc123</test283>
    <test284>abc123</test284>
    <test285>abc123</test285>
    <test286>abc123</test286>
    <test287>abc123</test287>
    <test288>abc123</test288>
    <test289>abc123</test289>
    <test290>abc123</test290>
    <test291>abc123</test291>
    <test292>abc123</test292>
    <test293>abc123</test293>
    <test294>abc123</test294>
    <test295>abc123</test295>
    <test296>abc123</test296>
    <test297>abc123</test297>
    <test298>abc123</test298>
    <test299>abc123</test299>
    <test300>abc123</test300>
    <test301>abc123</test301>
    <test302>abc123</test302>
    <test303>abc123</test303>
    <test304>abc123</test304>
    <test305>abc123</test305>
    <test306>abc123</test306>
    <test307>abc123</test307>
    <test308>abc123</test308>
    <test309>abc123</test309>
    <test310>abc123</test310>
    <test311>abc123</test311>
    <test312>abc123</test312>
    <test313>abc123</test313>
    <test314>abc123</test314>
    <test315>abc123</test315>
    <test316>abc123</test316>
    <test317>abc123</test317>
    <test318>abc123</test318>
    <test319>abc123</test319>
    <test320>abc123</test320>
    <test321>abc123</test321>
    <test322>abc123</test322>
    <test323>abc123</test323>
    <test324>abc123</test324>
    <test325>abc123</test325>
    <test326>abc123</test326>
    <test327>abc123</test327>
    <test328>abc123</test328>
    <test329>abc123</test329>
    <test330>abc123</test330>
    <test331>abc123</test331>
    <test332>abc123</test332>
    <test333>abc123</test333>
    <test334>abc123</test334>
    <test335>abc123</test335>
    <test336>abc123</test336>
    <test337>abc123</test337>
    <test338>abc123</test338>
    <test339>abc123</test339>
    <test340>abc123</test340>
    <test341>abc123</test341>
    <test342>abc123</test342>
    <test343>abc123</test343>
    <test344>abc123</test344>
    <test345>abc123</test345>
    <test346>abc123</test346>
    <test347>abc123</test347>
    <test348>abc123</test348>
    <test349>abc123</test349>
    <test350>abc123</test350>
    <test351>abc123</test351>
    <test352>abc123</test352>
    <test353>abc123</test353>
    <test354>abc123</test354>
    <test355>abc123</test355>
    <test356>abc123</test356>
    <test357>abc123</test357>
    <test358>abc123</test358>
    <test359>abc123</test359>
    <test360>abc123</test360>
    <test361>abc123</test361>
    <test362>abc123</test362>
    <test363>abc123</test363>
    <test364>abc123</test364>
    <test365>abc123</test365>
    <test366>abc123</test366>
    <test367>abc123</test367>
    <test368>abc123</test368>
    <test369>abc123</test369>
    <test370>abc123</test370>
    <test371>abc123</test371>
    <test372>abc123</test372>
    <test373>abc123</test373>
    <test374>abc123</test374>
    <test375>abc123</test375>
    <test376>abc123</test376>
    <test377>abc123</test377>
    <test378>abc123</test378>
    <test379>abc123</test379>
    <test380>abc123</test380>
    <test381>abc123</test381>
    <test382>abc123</test382>
    <test383>abc123</test383>
    <test384>abc123</test384>
    <test385>abc123</test385>
    <test386>abc123</test386>
    <test387>abc123</test387>
    <test388>abc123</test388>
    <test389>abc123</test389>
    <test390>abc123</test390>
    <test391>abc123</test391>
    <test392>abc123</test392>
    <test393>abc123</test393>
    <test394>abc123</test394>
    <test395>abc123</test395>
    <test396>abc123</test396>
    <test397>abc123</test397>
    <test398>abc123</test398>
    <test399>abc123</test399>
    <test400>abc123</test400>
    <test401>abc123</test401>
    <test402>abc123</test402>
    <test403>abc123</test403>
    <test404>abc123</test404>
    <test405>abc123</test405>
    <test406>abc123</test406>
    <test407>abc123</test407>
    <test408>abc123</test408>
    <test409>abc123</test409>
    <test410>abc123</test410>
    <test411>abc123</test411>
    <test412>abc123</test412>
    <test413>abc123</test413>
    <test414>abc123</test414>
    <test415>abc123</test415>
    <test416>abc123</test416>
    <test417>abc123</test417>
    <test418>abc123</test418>
    <test419>abc123</test419>
    <test420>abc123</test420>
    <test421>abc123</test421>
    <test422>abc123</test422>
    <test423>abc123</test423>
    <test424>abc123</test424>
    <test425>abc123</test425>
    <test426>abc123</test426>
    <test427>abc123</test427>
    <test428>abc123</test428>
    <test429>abc123</test429>
    <test430>abc123</test430>
    <test431>abc123</test431>
    <test432>abc123</test432>
    <test433>abc123</test433>
    <test434>abc123</test434>
    <test435>abc123</test435>
    <test436>abc123</test436>
    <test437>abc123</test437>
    <test438>abc123</test438>
    <test439>abc123</test439>
    <test440>abc123</test440>
    <test441>abc123</test441>
    <test442>abc123</test442>
    <test443>abc123</test443>
    <test444>abc123</test444>
    <test445>abc123</test445>
    <test446>abc123</test446>
    <test447>abc123</test447>
    <test448>abc123</test448>
    <test449>abc123</test449>
    <test450>abc123</test450>
    <test451>abc123</test451>
    <test452>abc123</test452>
    <test453>abc123</test453>
    <test454>abc123</test454>
    <test455>abc123</test455>
    <test456>abc123</test456>
    <test457>abc123</test457>
    <test458>abc123</test458>
    <test459>abc123</test459>
    <test460>abc123</test460>
    <test461>abc123</test461>
    <test462>abc123</test462>
    <test463>abc123</test463>
    <test464>abc123</test464>
    <test465>abc123</test465>
    <test466>abc123</test466>
    <test467>abc123</test467>
    <test468>abc123</test468>
    <test469>abc123</test469>
    <test470>abc123</test470>
    <test471>abc123</test471>
    <test472>abc123</test472>
    <test473>abc123</test473>
    <test474>abc123</test474>
    <test475>abc123</test475>
    <test476>abc123</test476>
    <test477>abc123</test477>
    <test478>abc123</test478>
    <test479>abc123</test479>
    <test480>abc123</test480>
    <test481>abc123</test481>
    <test482>abc123</test482>
    <test483>abc123</test483>
    <test484>abc123</test484>
    <test485>abc123</test485>
    <test486>abc123</test486>
    <test487>abc123</test487>
    <test488>abc123</test488>
    <test489>abc123</test489>
    <test490>abc123</test490>
    <test491>abc123</test491>
    <test492>abc123</test492>
    <test493>abc123</test493>
    <test494>abc123</test494>
    <test495>abc123</test495>
    <test496>abc123</test496>
    <test497>abc123</test497>
    <test498>abc123</test498>
    <test499>abc123</test499>
    <test500>abc123</test500>
    <test501>abc123</test501>
    <test502>abc123</test502>
    <test503>abc123</test503>
    <test504>abc123</test504>
    <test505>abc123</test505>
    <test506>abc123</test506>
    <test507>abc123</test507>
    <test508>abc123</test508>
    <test509>abc123</test509>
    <test510>abc123</test510>
    <test511>abc123</test511>
    <test512>abc123</test512>
    <test513>abc123</test513>
    <test514>abc123</test514>
    <test515>abc123</test515>
    <test516>abc123</test516>
    <test517>abc123</test517>
    <test518>abc123</test518>
    <test519>abc123</test519>
    <test520>abc123</test520>
    <test521>abc123</test521>
    <test522>abc123</test522>
    <test523>abc123</test523>
    <test524>abc123</test524>
    <test525>abc123</test525>
    <test526>abc123</test526>
    <test527>abc123</test527>
    <test528>abc123</test528>
    <test529>abc123</test529>
    <test530>abc123</test530>
    <test531>abc123</test531>
    <test532>abc123</test532>
    <test533>abc123</test533>
    <test534>abc123</test534>
    <test535>abc123</test535>
    <test536>abc123</test536>
    <test537>abc123</test537>
    <test538>abc123</test538>
    <test539>abc123</test539>
    <test540>abc123</test540>
    <test541>abc123</test541>
    <test542>abc123</test542>
    <test543>abc123</test543>
    <test544>abc123</test544>
    <test545>abc123</test545>
    <test546>abc123</test546>
    <test547>abc123</test547>
    <test548>abc123</test548>
    <test549>abc123</test549>
    <test550>abc123</test550>
    <test551>abc123</test551>
    <test552>abc123</test552>
    <test553>abc123</test553>
    <test554>abc123</test554>
    <test555>abc123</test555>
    <test556>abc123</test556>
    <test557>abc123</test557>
    <test558>abc123</test558>
    <test559>abc123</test559>
    <test560>abc123</test560>
    <test561>abc123</test561>
    <test562>abc123</test562>
    <test563>abc123</test563>
    <test564>abc123</test564>
    <test565>abc123</test565>
    <test566>abc123</test566>
    <test567>abc123</test567>
    <test568>abc123</test568>
    <test569>abc123</test569>
    <test570>abc123</test570>
    <test571>abc123</test571>
    <test572>abc123</test572>
    <test573>abc123</test573>
    <test574>abc123</test574>
    <test575>abc123</test575>
    <test576>abc123</test576>
    <test577>abc123</test577>
    <test578>abc123</test578>
    <test579>abc123</test579>
    <test580>abc123</test580>
    <test581>abc123</test581>
    <test582>abc123</test582>
    <test583>abc123</test583>
    <test584>abc123</test584>
    <test585>abc123</test585>
    <test586>abc123</test586>
    <test587>abc123</test587>
    <test588>abc123</test588>
    <test589>abc123</test589>
    <test590>abc123</test590>
    <test591>abc123</test591>
    <test592>abc123</test592>
    <test593>abc123</test593>
    <test594>abc123</test594>
    <test595>abc123</test595>
    <test596>abc123</test596>
    <test597>abc123</test597>
    <test598>abc123</test598>
    <test599>abc123</test599>
    <test600>abc123</test600>
    <test601>abc123</test601>
    <test602>abc123</test602>
    <test603>abc123</test603>
    <test604>abc123</test604>
    <test605>abc123</test605>
    <test606>abc123</test606>
    <test607>abc123</test607>
    <test608>abc123</test608>
    <test609>abc123</test609>
    <test610>abc123</test610>
    <test611>abc123</test611>
    <test612>abc123</test612>
    <test613>abc123</test613>
    <test614>abc123</test614>
    <test615>abc123</test615>
    <test616>abc123</test616>
    <test617>abc123</test617>
    <test618>abc123</test618>
    <test619>abc123</test619>
    <test620>abc123</test620>
    <test621>abc123</test621>
    <test622>abc123</test622>
    <test623>abc123</test623>
    <test624>abc123</test624>
    <test625>abc123</test625>
    <test626>abc123</test626>
    <test627>abc123</test627>
    <test628>abc123</test628>
    <test629>abc123</test629>
    <test630>abc123</test630>
    <test631>abc123</test631>
    <test632>abc123</test632>
    <test633>abc123</test633>
    <test634>abc123</test634>
    <test635>abc123</test635>
    <test636>abc123</test636>
    <test637>abc123</test637>
    <test638>abc123</test638>
    <test639>abc123</test639>
    <test640>abc123</test640>
    <test641>abc123</test641>
    <test642>abc123</test642>
    <test643>abc123</test643>
    <test644>abc123</test644>
    <test645>abc123</test645>
    <test646>abc123</test646>
    <test647>abc123</test647>
    <test648>abc123</test648>
    <test649>abc123</test649>
    <test650>abc123</test650>
    <test651>abc123</test651>
    <test652>abc123</test652>
    <test653>abc123</test653>
    <test654>abc123</test654>
    <test655>abc123</test655>
    <test656>abc123</test656>
    <test657>abc123</test657>
    <test658>abc123</test658>
    <test659>abc123</test659>
    <test660>abc123</test660>
    <test661>abc123</test661>
    <test662>abc123</test662>
    <test663>abc123</test663>
    <test664>abc123</test664>
    <test665>abc123</test665>
    <test666>abc123</test666>
    <test667>abc123</test667>
    <test668>abc123</test668>
    <test669>abc123</test669>
    <test670>abc123</test670>
    <test671>abc123</test671>
    <test672>abc123</test672>
    <test673>abc123</test673>
    <test674>abc123</test674>
    <test675>abc123</test675>
    <test676>abc123</test676>
    <test677>abc123</test677>
    <test678>abc123</test678>
    <test679>abc123</test679>
    <test680>abc123</test680>
    <test681>abc123</test681>
    <test682>abc123</test682>
    <test683>abc123</test683>
    <test684>abc123</test684>
    <test685>abc123</test685>
    <test686>abc123</test686>
    <test687>abc123</test687>
    <test688>abc123</test688>
    <test689>abc123</test689>
    <test690>abc123</test690>
    <test691>abc123</test691>
    <test692>abc123</test692>
    <test693>abc123</test693>
    <test694>abc123</test694>
    <test695>abc123</test695>
    <test696>abc123</test696>
    <test697>abc123</test697>
    <test698>abc123</test698>
    <test699>abc123</test699>
</request>
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
export const initAjvBasedOnSchemaIdentifier = (
  schema: SchemaObject,
  options: Options = { coerceTypes: 'array', allErrors: false },
) => {
  let ajv: AjvDraft04 | Ajv;

  if (String(schema.$schema).includes('http://json-schema.org/draft-04/schema')) {
    ajv = new AjvDraft04(options);
  } else {
    ajv = new Ajv(options);
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
  }

  const validate = ajv.compile(schema);
  return { ajv, validate };
};
```

**Error messages**

```
![image_blur](https://user-images.githubusercontent.com/19943649/207558056-38cd625e-259a-4c7a-adf0-3fb2e467420f.jpg)
error: Maximum call stack size exceeded   RangeError: Maximum call stack size exceeded
    at If.get names [as names] (/home/path/node_modules/ajv/lib/compile/codegen/index.ts:250:25)
    at /home/path/node_modules/ajv/lib/compile/codegen/index.ts:191:73
    at Array.reduce (<anonymous>)
    at If.get names (/home/path/node_modules/ajv/lib/compile/codegen/index.ts:191:23)
    at If.get names [as names] (/home/path/node_modules/ajv/lib/compile/codegen/index.ts:250:25)
    at /home/path/node_modules/ajv/lib/compile/codegen/index.ts:191:73
    at Array.reduce (<anonymous>)
    at If.get names (/home/path/node_modules/ajv/lib/compile/codegen/index.ts:191:23)
    at If.get names [as names] (/home/path/node_modules/ajv/lib/compile/codegen/index.ts:250:25)
    at /home/path/node_modules/ajv/lib/compile/codegen/index.ts:191:73
    at Array.reduce (<anonymous>)
    at If.get names (/home/path/node_modules/ajv/lib/compile/codegen/index.ts:191:23)
    at If.get names [as names] (/home/path/node_modules/ajv/lib/compile/codegen/index.ts:250:25)
    at /home/path/node_modules/ajv/lib/compile/codegen/index.ts:191:73
    at Array.reduce (<anonymous>)
    at If.get names (/home/path/node_modules/ajv/lib/compile/codegen/index.ts:191:23) requestId = 123, sessionId = 123, uid = 123

```

**What results did you expect?**
We can create the validate function from this schema

**Are you going to resolve the issue?**
I temporarily resolved this issue by turning on the allErrors option to true

**Note**
It'll throw the error when the XML includes around 700 nodes. If I remove some nodes in my example file, it'll work as usual
