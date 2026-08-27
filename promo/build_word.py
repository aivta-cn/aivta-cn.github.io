from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "docx" / "AIVTA2026-微信宣传材料汇编.docx"
POSTER = ROOT / "promo" / "AIVTA2026-专家阵容与主办单位.png"
BROCHURE = ROOT / "tmp" / "promo-pdf" / "page-1.png"

NAVY = "0B2545"
BLUE = "2E74B5"
CYAN = "1FA6C8"
LIGHT = "E8EEF5"
MUTED = "5B6B7A"
WHITE = "FFFFFF"
CHINESE_FONT = "Arial Unicode MS"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for edge, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{edge}"))
        if node is None:
            node = OxmlElement(f"w:{edge}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_run_font(run, size=None, bold=None, color=None, font=CHINESE_FONT):
    run.font.name = font
    run._element.rPr.rFonts.set(qn("w:eastAsia"), CHINESE_FONT)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color)


def add_page_number(paragraph):
    run = paragraph.add_run()
    fld_char_1 = OxmlElement("w:fldChar")
    fld_char_1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = " PAGE "
    fld_char_2 = OxmlElement("w:fldChar")
    fld_char_2.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_char_1, instr_text, fld_char_2])
    set_run_font(run, size=8.5, color=MUTED)


def set_alt_text(shape, text):
    doc_pr = shape._inline.docPr
    doc_pr.set("descr", text)
    doc_pr.set("title", text)


def add_paragraph(doc, text="", style=None, bold_prefix=None, color=None, align=None):
    p = doc.add_paragraph(style=style)
    if align is not None:
        p.alignment = align
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        set_run_font(r1, bold=True, color=color)
        r2 = p.add_run(text[len(bold_prefix):])
        set_run_font(r2, color=color)
    else:
        r = p.add_run(text)
        set_run_font(r, color=color)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    r = p.add_run(text)
    set_run_font(r)
    return p


def add_label_value(doc, label, value):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    r1 = p.add_run(label)
    set_run_font(r1, bold=True, color=BLUE)
    r2 = p.add_run(value)
    set_run_font(r2)
    return p


def add_section_break(doc):
    doc.add_section(WD_SECTION.NEW_PAGE)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    sec = doc.sections[0]
    sec.page_width = Inches(8.5)
    sec.page_height = Inches(11)
    sec.top_margin = Inches(1)
    sec.bottom_margin = Inches(1)
    sec.left_margin = Inches(1)
    sec.right_margin = Inches(1)
    sec.header_distance = Inches(0.492)
    sec.footer_distance = Inches(0.492)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = CHINESE_FONT
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), CHINESE_FONT)
    normal.font.size = Pt(11)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25

    for name, size, color, before, after in (
        ("Title", 30, NAVY, 0, 12),
        ("Subtitle", 14, MUTED, 0, 18),
        ("Heading 1", 16, BLUE, 18, 10),
        ("Heading 2", 13, NAVY, 14, 7),
        ("Heading 3", 12, "1F4D78", 10, 5),
    ):
        style = styles[name]
        style.font.name = CHINESE_FONT
        style._element.rPr.rFonts.set(qn("w:eastAsia"), CHINESE_FONT)
        style.font.size = Pt(size)
        style.font.color.rgb = RGBColor.from_string(color)
        style.font.bold = name != "Subtitle"
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True

    if "Kicker" not in styles:
        kicker = styles.add_style("Kicker", WD_STYLE_TYPE.PARAGRAPH)
    else:
        kicker = styles["Kicker"]
    kicker.font.name = CHINESE_FONT
    kicker._element.rPr.rFonts.set(qn("w:eastAsia"), CHINESE_FONT)
    kicker.font.size = Pt(11)
    kicker.font.bold = True
    kicker.font.color.rgb = RGBColor.from_string(CYAN)
    kicker.paragraph_format.space_after = Pt(8)
    kicker.paragraph_format.keep_with_next = True

    bullet = styles["List Bullet"]
    bullet.font.name = CHINESE_FONT
    bullet._element.rPr.rFonts.set(qn("w:eastAsia"), CHINESE_FONT)
    bullet.font.size = Pt(11)
    bullet.paragraph_format.left_indent = Inches(0.375)
    bullet.paragraph_format.first_line_indent = Inches(-0.188)
    bullet.paragraph_format.space_after = Pt(4)
    bullet.paragraph_format.line_spacing = 1.25

    header = sec.header.paragraphs[0]
    header.text = "AIVTA 2026  |  微信宣传材料汇编"
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    for run in header.runs:
        set_run_font(run, size=8.5, color=MUTED)
    footer = sec.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = footer.add_run("aivta.org  |  adv@aivta.org  ·  ")
    set_run_font(r, size=8.5, color=MUTED)
    add_page_number(footer)

    # Cover — compact_reference_guide / customer_pack pattern.
    add_paragraph(doc, "AIVTA 2026 · PROMOTION PACK", style="Kicker")
    add_paragraph(doc, "微信宣传材料汇编", style="Title")
    add_paragraph(doc, "微信群文案 · 朋友圈文案 · 专家阵容海报 · 会议征稿简章", style="Subtitle")
    add_paragraph(doc, "首届AI视频技术及其应用国际会议", style="Heading 2")
    add_paragraph(doc, "International Conference on AI Video Technology and Applications", color=MUTED)
    add_paragraph(doc, "")
    add_label_value(doc, "会议时间　", "2026年11月13日—15日")
    add_label_value(doc, "会议地点　", "中国·安徽·合肥")
    add_label_value(doc, "全文截止　", "2026年10月8日")
    add_label_value(doc, "主办单位　", "IEEE中国联合会（IEEE China Council）")
    add_label_value(doc, "投稿咨询　", "adv@aivta.org  |  https://aivta.org")
    add_paragraph(doc, "")
    p = add_paragraph(doc, "传播核心：权威学术阵容、AI视频前沿交流、成果展示与同行反馈，以及论文集拟提交 EI Compendex / Scopus 检索。", color=WHITE)
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.left_indent = Inches(0.16)
    p.paragraph_format.right_indent = Inches(0.16)
    p_pr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), NAVY)
    p_pr.append(shd)
    note = add_paragraph(doc, "说明：EI Compendex 与 Scopus 为独立数据库，最终检索结果以数据库审核为准。", color=MUTED)
    note.runs[0].italic = True

    doc.add_page_break()
    add_paragraph(doc, "使用说明", style="Heading 1")
    add_paragraph(doc, "本汇编将三份宣传成品统一到一个 Word 文件中，便于组委会审阅、转发和后续修改。")
    add_bullet(doc, "微信群：优先发送专家阵容海报，再粘贴群发文案，最后附会议征稿简章 PDF。")
    add_bullet(doc, "朋友圈：建议按“专家阵容与主办单位 → 参会价值 → 征稿信息”顺序发布三张图，并配朋友圈文案。")
    add_bullet(doc, "如会议时间、地点、投稿方式或出版安排更新，应同步修改文案、海报和简章。")
    add_paragraph(doc, "核心亮点", style="Heading 2")
    add_bullet(doc, "大会主席梁昌勇教授：教育部“长江学者”特聘教授、国务院特殊津贴专家，合肥工业大学科研院副院长。")
    add_bullet(doc, "大会共同主席蒋翠清教授：国家高层次人才计划入选者、国务院特殊津贴专家，合肥工业大学二级教授、博士生导师。")
    add_bullet(doc, "出版委员会主席周孟奇：IEEE中国联合会常务副主席、IEEE中国会议委员会主席。")
    add_bullet(doc, "主办单位：IEEE中国联合会。")
    add_bullet(doc, "论文集拟提交 EI Compendex 和 Scopus 检索；组委会积极推进，最终以数据库独立审核为准。")

    doc.add_page_break()
    group_start = len(doc.paragraphs)
    add_paragraph(doc, "1　微信群发布文案", style="Heading 1")
    add_paragraph(doc, "【会议通知＋征稿】AIVTA 2026·首届AI视频技术及其应用国际会议", style="Heading 2")
    add_paragraph(doc, "【权威学术阵容】", style="Heading 3")
    add_paragraph(doc, "大会主席：梁昌勇（Changyong Liang）教授", style="Heading 3")
    add_paragraph(doc, "教育部“长江学者”特聘教授、国务院特殊津贴专家，合肥工业大学科研院副院长。")
    add_paragraph(doc, "大会共同主席：蒋翠清（Cuiqing Jiang）教授", style="Heading 3")
    add_paragraph(doc, "国家高层次人才计划入选者、国务院特殊津贴专家，合肥工业大学二级教授、博士生导师，主要从事人工智能与数据分析、金融科技、智能财务等领域研究。")
    add_paragraph(doc, "出版委员会主席：周孟奇（Mengqi Zhou）", style="Heading 3")
    add_paragraph(doc, "IEEE中国联合会常务副主席、IEEE中国会议委员会主席。")
    add_paragraph(doc, "主办单位：IEEE中国联合会（IEEE China Council）", style="Heading 3")
    add_paragraph(doc, "了解主办单位：https://cn.ieee.org/china_council/")
    add_paragraph(doc, "会议聚焦 AIGC、计算机视觉、视频生成、虚拟制片、智能后期、数字人、VR/AR/XR、影视大数据与 AI 治理等方向。")
    add_label_value(doc, "会议时间　", "2026年11月13日—15日")
    add_label_value(doc, "会议地点　", "中国·安徽·合肥")
    add_label_value(doc, "全文投稿截止　", "2026年10月8日")
    add_paragraph(doc, "【参会与投稿收获】", style="Heading 2")
    for item in (
        "在主旨报告、技术分会和专题讨论中，集中了解 AI 视频的研究前沿与产业落地。",
        "与高校研究者、算法工程师、影视创作者和产业从业者面对面交流，寻找合作与跨学科连接。",
        "以口头或分组报告展示成果，获得同行反馈，帮助打磨论文和后续研究。",
        "经同行评审录用并完成规定流程的论文，将按会议出版计划提交论文集；论文集拟提交 EI Compendex 和 Scopus 检索，组委会将积极推进相关流程。",
        "优秀论文还有机会获得后续期刊推荐（需按相关期刊要求另行审核）。",
    ):
        add_bullet(doc, item)
    add_paragraph(doc, "征稿方向包括：生成式AI与创意内容、智能拍摄与虚拟制片、多模态感知与后期自动化、计算机图形学与VFX、影视大数据与智能分发、沉浸式媒体与交互叙事、合规与伦理治理、产业变革与人才培养。")
    add_label_value(doc, "投稿邮箱　", "adv@aivta.org")
    add_label_value(doc, "会议官网　", "https://aivta.org")
    add_paragraph(doc, "欢迎投稿、报告或以听众身份参会，也欢迎转发给有需要的老师、同学和行业朋友。")
    note = add_paragraph(doc, "检索说明：会议按计划推进论文集出版及 EI Compendex、Scopus 检索提交。两者为独立数据库，最终结果以其审核为准。", color=MUTED)
    note.runs[0].italic = True

    # The group post is intentionally dense: keep it on one distribution-ready page.
    for paragraph in doc.paragraphs[group_start:]:
        if paragraph.style.name in ("Normal", "List Bullet"):
            paragraph.paragraph_format.space_after = Pt(2.5)
            paragraph.paragraph_format.line_spacing = 1.10
            for run in paragraph.runs:
                run.font.size = Pt(10.2)

    doc.add_page_break()
    moments_start = len(doc.paragraphs)
    add_paragraph(doc, "2　微信朋友圈发布文案", style="Heading 1")
    add_paragraph(doc, "一场有学术阵容、有产业视角，也有成果传播机会的 AI 视频国际会议——AIVTA 2026。", style="Heading 2")
    add_paragraph(doc, "大会主席：梁昌勇教授", style="Heading 3")
    add_paragraph(doc, "教育部“长江学者”特聘教授、国务院特殊津贴专家，合肥工业大学科研院副院长。")
    add_paragraph(doc, "大会共同主席：蒋翠清教授", style="Heading 3")
    add_paragraph(doc, "国家高层次人才计划入选者、国务院特殊津贴专家，合肥工业大学二级教授、博士生导师。")
    add_paragraph(doc, "出版委员会主席：周孟奇", style="Heading 3")
    add_paragraph(doc, "IEEE中国联合会常务副主席、IEEE中国会议委员会主席。")
    add_paragraph(doc, "主办单位：IEEE中国联合会（IEEE China Council）", style="Heading 3")
    add_paragraph(doc, "从 AIGC 视频生成、数字人、虚拟制片和智能剪辑，到 VR/AR/XR、版权治理和人机协作，它把“技术怎么做”和“行业怎么用”放到了同一个交流现场。")
    add_paragraph(doc, "对研究者和研究生来说，可以展示成果、听取同行反馈、寻找合作；对影视、内容和技术从业者来说，则是一次集中了解 AI 视频新工具、新流程和新应用的机会。")
    add_paragraph(doc, "经同行评审录用并完成规定流程的论文，将按会议出版计划提交论文集；论文集拟提交 EI Compendex 和 Scopus 检索，组委会将积极推进相关流程，最终以数据库审核结果为准。")
    add_label_value(doc, "会议时间　", "2026.11.13—15")
    add_label_value(doc, "会议地点　", "中国·安徽·合肥")
    add_label_value(doc, "全文截止　", "2026.09.30")
    add_label_value(doc, "投稿邮箱　", "adv@aivta.org")
    add_label_value(doc, "会议官网　", "https://aivta.org")
    add_paragraph(doc, "感兴趣的朋友可以看图了解，也欢迎转给做 AI、计算机视觉、数字媒体和影视技术的朋友。")
    add_paragraph(doc, "主办单位介绍：https://cn.ieee.org/china_council/")
    add_paragraph(doc, "#AI视频  #AIGC  #计算机视觉  #虚拟制片  #学术会议  #论文征稿", color=BLUE)

    # Keep the shorter Moments post on a single page.
    for paragraph in doc.paragraphs[moments_start:]:
        if paragraph.style.name == "Normal":
            paragraph.paragraph_format.space_after = Pt(2)
            paragraph.paragraph_format.line_spacing = 1.05
            for run in paragraph.runs:
                run.font.size = Pt(9.8)
        elif paragraph.style.name == "Heading 3":
            paragraph.paragraph_format.space_before = Pt(5)
            paragraph.paragraph_format.space_after = Pt(2)
            for run in paragraph.runs:
                run.font.size = Pt(11.5)

    doc.add_page_break()
    add_paragraph(doc, "3　专家阵容与主办单位海报", style="Heading 1")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    shape = p.add_run().add_picture(str(POSTER), width=Inches(5.35))
    set_alt_text(shape, "AIVTA 2026 专家阵容与主办单位海报，包含梁昌勇、蒋翠清、周孟奇及 IEEE 中国联合会信息")
    caption = add_paragraph(doc, "图 1　专家阵容与主办单位海报（无头像版）", align=WD_ALIGN_PARAGRAPH.CENTER, color=MUTED)
    caption.runs[0].italic = True

    doc.add_page_break()
    add_paragraph(doc, "4　会议征稿简章", style="Heading 1")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    shape = p.add_run().add_picture(str(BROCHURE), width=Inches(5.20))
    set_alt_text(shape, "AIVTA 2026 一页会议征稿简章，含会议价值、征稿方向、投稿要求、重要时间和 EI/Scopus 提交说明")
    caption = add_paragraph(doc, "图 2　AIVTA 2026 会议征稿简章", align=WD_ALIGN_PARAGRAPH.CENTER, color=MUTED)
    caption.runs[0].italic = True

    doc.add_page_break()
    add_paragraph(doc, "5　发布前复核", style="Heading 1")
    for item in (
        "官网、投稿截止日期、会议地点及投稿邮箱是否有更新。",
        "若尚无 IEEE 会议编号或最终出版协议，不使用“IEEE正式出版”“IEEE Xplore必然收录”等确定性表述。",
        "不使用“100% EI/Scopus检索”“包检索”“确保收录”等表述。",
        "期刊推荐表述为“有机会获得推荐，需另行审稿”，不等同于录用或发表。",
        "人物职务对外发布前，由组委会再次确认最新信息。",
    ):
        add_bullet(doc, item)
    add_paragraph(doc, "人物与机构信息来源", style="Heading 2")
    add_label_value(doc, "梁昌勇教授　", "合肥工业大学公开介绍：https://www.hfut.edu.cn/znhlahssys/info/1015/1057.htm")
    add_label_value(doc, "蒋翠清教授　", "合肥工业大学教师主页：https://faculty.hfut.edu.cn/~2mY3Iz/zh_CN/")
    add_label_value(doc, "周孟奇职务　", "IEEE中国联合会：https://cn.ieee.org/china_council/；IEEE中国分会：https://cn.ieee.org/china_section/")
    add_paragraph(doc, "出版与检索说明", style="Heading 2")
    add_paragraph(doc, "会议宣传可以突出论文集拟提交 EI Compendex 和 Scopus 检索，以及组委会将积极推进相关流程；但不应把“提交检索”表述为“必然检索”。数据库是否最终检索取决于其独立审核结果。")

    # Keep all sections consistent, including any page-break sections created by Word.
    for section in doc.sections:
        section.page_width = Inches(8.5)
        section.page_height = Inches(11)
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        section.header_distance = Inches(0.492)
        section.footer_distance = Inches(0.492)

    core = doc.core_properties
    core.title = "AIVTA 2026 微信宣传材料汇编"
    core.subject = "微信群文案、朋友圈文案、专家阵容海报与会议征稿简章"
    core.author = "AIVTA 2026 组委会"
    core.keywords = "AIVTA 2026, AI视频, 微信宣传, 会议征稿, EI Compendex, Scopus"
    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build()
