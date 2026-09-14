from django.core.management.base import BaseCommand
from learning.models import Course, Module, Lesson, Resource


def b(kind, title='', text='', **extra):
    data = {'type': kind}
    if title: data['title'] = title
    if text: data['text'] = text
    data.update(extra)
    return data

RESEARCH_DEFINITION = [
    b('intro', text='Research is a structured and systematic process of collecting, analysing and interpreting information to generate evidence, solve problems and expand knowledge.'),
    b('explain','Simple definition','Research means seeking reliable answers through careful investigation rather than relying on assumptions or opinions.'),
    b('model','Academic definition','Creswell (2008) describes research as a systematic process of inquiry involving the collection, analysis and interpretation of data to increase understanding of a phenomenon and contribute to knowledge.'),
    b('practice','Write it in your own words','Explain research in one or two sentences, then add the citation (Creswell, 2008).', prompt='Your paraphrase'),
    b('apply','Real-life example','A shop owner notices sales dropped last month. Instead of guessing, she reviews sales records and asks customers what changed. She is collecting evidence before deciding what to do.'),
]

PURPOSES = [
    ('Solve practical problems','Research provides evidence for solving problems and making informed decisions rather than relying on guesswork.','A school investigates poor Mathematics performance using exam results, interviews and teaching-method reviews before choosing an intervention.'),
    ('Explain why things happen','Explanatory research identifies patterns and relationships that help explain events, behaviour and social phenomena.','An NGO studies why some communities still practise mob justice despite access to formal courts.'),
    ('Improve policy','Research gives policymakers evidence about current conditions, emerging problems and likely future developments.','A Ministry of Education studies secondary-school dropout before developing a student-retention policy.'),
    ('Expand knowledge','Research can be driven by curiosity and the desire for intellectual growth, not only by an immediate practical problem.','A postgraduate student studies how social media influences study habits to deepen understanding of the topic.'),
    ('Support prediction','Past and present evidence can reveal trends that help people and organisations prepare for future events.','A health agency analyses five years of malaria data to predict where future outbreaks are likely.'),
    ('Fulfil academic or institutional requirements','Research develops knowledge and research skills while meeting degree, professional or institutional requirements.','A final-year student completes a supervised research project as part of a degree requirement.'),
]
PURPOSE_CONTENT = [b('intro', text='People conduct research for different reasons. The common thread is disciplined use of evidence to understand, decide, improve or discover.')] + sum(([b('heading',title=t), b('explain', text=d), b('apply','Example',e)] for t,d,e in PURPOSES), []) + [b('practice','Your turn','Choose one purpose above and write a two-sentence example from your own field.', prompt='My example')]

RESEARCH_PROBLEM = [
    b('intro', text='A research problem is the gap between what is happening and what should be happening. Something does not add up, and evidence is needed to understand why.'),
    b('explain','Definition of a research problem','A research problem exists when the current state differs from the desired state and there is no acceptable solution already available or agreed upon.'),
    b('model','Academic wording','Sekaran (2003) explains that a problem exists when there is a discrepancy between the current and ideal state and no satisfactory solution is available.'),
    b('practice','Paraphrase it','Explain the idea in your own words and include an in-text citation to Sekaran (2003).', prompt='My paraphrase'),
    b('apply','Real-life example','Microfinance programmes promise that loans help small traders grow. If evidence shows many businesses close within their first years despite receiving loans, the gap between the expected and observed outcome becomes a research problem.'),
    b('heading','Sources of a Research Problem'),
    b('cards', items=[
        {'title':'Observation and reasoning','text':'Notice a pattern or anomaly in real life and narrow it into a specific problem.'},
        {'title':'Literature review','text':'Prior studies often identify unanswered questions or recommend further research.'},
        {'title':'Authority or directive','text':'An institution, supervisor or government body may assign an area for investigation.'},
        {'title':'Theories or perspectives','text':'A theory can be tested in a new context, revealing a problem worth studying.'},
        {'title':'Social or current issues','text':'Current community needs such as unemployment, service access or health can generate research problems.'},
        {'title':'Media','text':'Repeated reporting can signal a problem that merits formal investigation.'},
        {'title':'Discussions with experts','text':'Seminars, classes and practitioner conversations can surface relevant research problems.'},
    ]),
]
RESEARCH_PROBLEM_QUIZ = [
    {'id':'rp1','question':'A student notices boda boda riders changing routes to avoid traffic police and wonders why. What source is this?','options':['Observation and reasoning','Literature review','Authority or directive','Media'],'answer':'Observation and reasoning'},
    {'id':'rp2','question':'A published study recommends further research on rural youth unemployment. What source is this?','options':['Literature review','Media','Social issue','Theory'],'answer':'Literature review'},
    {'id':'rp3','question':'A ministry assigns a team to investigate low tax compliance in one district. What source is this?','options':['Authority or directive','Observation and reasoning','Media','Theory'],'answer':'Authority or directive'},
]

CHARACTERISTICS = [
    ('Widespread implications','A strong problem can inform thinking, practice or decisions beyond a single local case.','A study of mobile-money fraud in one district may inform fraud prevention across the regional fintech sector.'),
    ('Challenges commonly held assumptions','Influential problems question ideas people usually take for granted instead of merely confirming them.','Rather than assuming microfinance helps every small business, a study can test whether it deepens dependency for the poorest borrowers.'),
    ('Exposes gaps in laws, views and policies','A research problem becomes stronger when it shows that a current framework is outdated, incomplete or failing.','A study can show that data-protection rules do not adequately address AI-driven mobile lending.'),
    ('Reasonable, well-defined scope','The problem should be narrow enough to investigate thoroughly but broad enough to matter.','“Technology and African economies” is too broad; “mobile-money adoption and informal-sector savings in Kampala” is workable.'),
    ('Clearly written to capture reader interest','The opening should be concise and make the stakes of the problem immediately understandable.','“Why do half of small businesses fail within two years of taking a loan?” signals relevance more clearly than a vague variable statement.'),
    ('Specific and researchable','A problem must be precise enough to investigate with evidence and a defined method.','“Youth unemployment” is a topic; employment outcomes among urban youth aged 18–25 in Kampala is researchable.'),
    ('Scope clearly indicated','Population, time frame, geography and variables should show the boundaries of the study.','A study may explicitly limit itself to registered SMEs in Kampala CBD between 2024 and 2026.'),
    ('Importance and purpose are clear','Readers should understand what the study aims to add and who can use the findings.','A study on loan default can explicitly aim to inform targeted consumer-protection interventions.'),
]
CHAR_CONTENT = [b('intro',text='A good research problem should pass several tests before you commit to it. These checks protect you from choosing a topic that is vague, trivial or impossible to investigate.')] + sum(([b('heading',title=t), b('explain',text=d), b('apply','Applied example',e)] for t,d,e in CHARACTERISTICS), [])

STEPS = [
    ('Step 1 — Define the problem area','Start with the broad situation in which you sense a need for research. It is a zone of concern, not yet a specific question.','A policing student notices that some senior officers appear unusually wealthy relative to their salaries.'),
    ('Step 2 — State the problem in general terms','Put the broad concern into words. It is still general, but it has moved from a feeling to a stated topic.','“Amassing of wealth by senior police officers in Uganda through corruption.”'),
    ('Step 3 — Identify the specific problem','Narrow the general topic by asking what kind, among whom, where and how, while consulting literature and practitioners.','“What corruption practices allow senior police officers in Kampala to accumulate unexplained wealth?”'),
    ('Step 4 — Identify sources of information','Use primary and secondary evidence to sharpen and confirm that the problem is real and specific enough to study.','Review anti-corruption reports and prior studies, then interview officers or practitioners with firsthand knowledge.'),
]
STEPS_CONTENT = [b('intro',text='Move from a broad problem area to a specific, researchable problem through a deliberate funnel.')] + sum(([b('heading',title=t),b('explain',text=d),b('apply','Example',e)] for t,d,e in STEPS), [])
STEPS_QUIZ = [
    {'id':'st1','question':'A student simply notices girls disappearing from school before graduation but has not asked a specific question yet.','options':['Step 1','Step 2','Step 3','Step 4'],'answer':'Step 1'},
    {'id':'st2','question':'She writes: “High dropout rates among girls in rural secondary schools.”','options':['Step 1','Step 2','Step 3','Step 4'],'answer':'Step 2'},
    {'id':'st3','question':'After evidence gathering she asks what factors contribute to early-marriage-related dropout among girls aged 14–16 in district X.','options':['Step 1','Step 2','Step 3','Step 4'],'answer':'Step 3'},
    {'id':'st4','question':'She reviews ministry statistics and interviews teachers before finalising the problem.','options':['Step 1','Step 2','Step 3','Step 4'],'answer':'Step 4'},
]

# IMPORTANT: this content is seeded only into the Django backend and never bundled into the public React build.
PROBLEM_ANALYSIS = [
    b('intro', text='Not every problem needs the same kind of analysis. Choose the diagnostic question that matches the kind of problem you are facing.'),
    b('heading','Path A — Condition-Based Problems'),
    b('explain',text='Something is simply wrong right now and you need to explain why. Map the causes of the central problem and the consequences that flow from it.'),
    b('model','Academic model','Problem tree analysis maps a central problem’s causes as roots and its consequences as branches, creating a structured account of interconnected factors (European Commission, 2004).'),
    b('apply','Example','A district health office identifies low immunisation coverage. Repeated “why?” questions expose causes such as distance to clinics and misinformation; “so what?” questions expose effects such as preventable disease outbreaks.'),
    b('practice','Your turn','Name a current condition in your setting. List three likely causes and three consequences.',prompt='My condition analysis'),
    b('heading','Path B — Process-Based Problems'),
    b('explain',text='A process was designed to work one way but does not work that way in practice. Compare the intended “to-be” state with the current “as-is” state and locate the breakdown.'),
    b('model','Academic model','Gap analysis systematically compares a designed process with current practice to locate where a process breaks down (Castro, Marcos, & Vara, 2013).'),
    b('apply','Example','A university registration system is designed to take 10 minutes, but students spend hours, encounter crashes and still need an office visit. The research problem lies in the gap between design and reality.'),
    b('practice','Your turn','Choose one process. Write what should happen, what actually happens, and where you suspect the gap occurs.',prompt='My process analysis'),
    b('heading','Path C — Historical / Narrative Problems'),
    b('explain',text='Some present-day problems can only be understood by tracing the sequence of past decisions, events or developments that produced the current situation.'),
    b('model','Academic model','Process tracing examines evidence in the sequence in which it occurred, treating each piece as part of a chain connecting a past starting point to a present outcome (Collier, 2011).'),
    b('apply','Example','To understand continued use of a colonial-era land system, a researcher traces colonial policy, decisions at independence, later reforms and local resistance in sequence.'),
    b('practice','Your turn','Choose a problem with a history. List four turning points that may explain how the current situation developed.',prompt='My historical chain'),
    b('heading','Path D — Comparative / Disparity-Based Problems'),
    b('explain',text='Two settings that should reasonably be similar are not. The difference itself is the problem that needs explanation.'),
    b('apply','Example','Two neighbouring districts have similar populations and health budgets but very different maternal mortality rates. The disparity becomes the starting point for investigation.'),
    b('practice','Your turn','Describe two groups, places or systems that should be similar but show an important difference.',prompt='My comparison'),
    b('callout','Choosing the path','Use Condition when something is wrong now; Process when practice differs from design; Historical when the sequence over time matters; Comparative when an unexplained difference between similar cases is the key puzzle.'),
]
PROBLEM_ANALYSIS_QUIZ = [
    {'id':'pa1','question':'A researcher maps causes and consequences of high teenage pregnancy rates.','options':['Condition-Based','Process-Based','Historical','Comparative'],'answer':'Condition-Based'},
    {'id':'pa2','question':'A complaint system promises resolution in 48 hours but takes two weeks.','options':['Condition-Based','Process-Based','Historical','Comparative'],'answer':'Process-Based'},
    {'id':'pa3','question':'A study reconstructs policy decisions since 1990 to explain a present settlement pattern.','options':['Condition-Based','Process-Based','Historical','Comparative'],'answer':'Historical'},
    {'id':'pa4','question':'Two neighbouring districts have similar budgets but very different maternal mortality rates.','options':['Condition-Based','Process-Based','Historical','Comparative'],'answer':'Comparative'},
]

LIT_REVIEW = [
    b('intro',text='A literature review is not a list of summaries. It is an argument about what the existing evidence collectively shows, where authors agree or disagree, and what remains unresolved.'),
    b('heading','Layer 1 — Understand each source'),
    b('explain',text='Identify the source’s purpose, context, method, key finding and limitation before you attempt to cite it.'),
    b('practice','Source note','For one source, capture: purpose, method, key finding, limitation and relevance to your topic.',prompt='My source note'),
    b('heading','Layer 2 — Group sources by idea'),
    b('explain',text='Organise literature around themes, concepts or debates rather than one paragraph per author.'),
    b('apply','Example','Three studies on digital learning might fit under access, engagement and assessment rather than being discussed in publication order.'),
    b('heading','Layer 3 — Synthesize'),
    b('explain',text='Put authors into conversation: show agreement, contradiction, extension, methodological differences and patterns across contexts.'),
    b('model','Synthesis sentence','While several studies associate mobile learning with improved access, evidence on sustained engagement is mixed, particularly in low-bandwidth settings.'),
    b('heading','Layer 4 — Write in your academic voice'),
    b('explain',text='Your paragraph should be driven by your analytical point. Sources support the point; they should not replace your voice.'),
    b('practice','Build a paragraph','Write one topic sentence, synthesize at least two sources, explain what the pattern means, then identify what remains unresolved.',prompt='My synthesis paragraph'),
]

SOURCE_SYNTHESIS = [
    b('intro',text='Synthesis means combining evidence to make a larger analytical point. This lesson turns raw source notes into a coherent paragraph.'),
    b('explain','1. Start with the claim','Decide what the paragraph needs to establish before choosing quotations or citations.'),
    b('explain','2. Select evidence','Choose sources that genuinely speak to the same theme, even when they disagree.'),
    b('explain','3. Compare explicitly','Use relationship words such as similarly, however, in contrast, extends, and despite.'),
    b('explain','4. Interpret','Explain why the agreement or disagreement matters for your own research problem.'),
    b('apply','Mini example','Source A finds online registration improves convenience; Source B finds students still seek physical verification. A synthesis asks what conditions explain the difference rather than simply reporting both studies.'),
    b('practice','Your turn','Write a 120–180 word synthesis paragraph using two or three sources from your topic.',prompt='My synthesis'),
]

METHODOLOGY = [
    b('intro',text='Methodology explains how the study will produce credible evidence. Every choice should connect directly to the research problem, questions and type of evidence required.'),
    b('heading','Research design'), b('explain',text='Choose a design that fits the question: qualitative for depth and meaning, quantitative for measurement and relationships, or mixed methods when both are needed.'),
    b('heading','Population and sampling'), b('explain',text='Define who or what the study concerns, then select a sampling approach that can provide relevant evidence within practical constraints.'),
    b('heading','Data collection'), b('explain',text='Select instruments—questionnaires, interviews, observation, records or measurements—based on the information required, not convenience alone.'),
    b('heading','Data analysis'), b('explain',text='Plan how evidence will answer each research question: statistics for numerical patterns, thematic analysis for qualitative meaning, or an integrated approach for mixed methods.'),
    b('heading','Quality and ethics'), b('explain',text='Address validity or trustworthiness, informed consent, confidentiality, data protection and limitations before data collection begins.'),
    b('practice','Method alignment check','For one research question, state the data needed, who can provide it, the collection method and the analysis method.',prompt='My alignment plan'),
]

COMM_PRINCIPLES = [
    b('intro',text='Effective workplace communication helps the receiver understand the message, know what matters and know what to do next.'),
    b('cards',items=[
        {'title':'Clarity','text':'Use specific language and one main purpose.'},{'title':'Conciseness','text':'Remove repetition and unnecessary words.'},{'title':'Completeness','text':'Include the information needed for action.'},{'title':'Correctness','text':'Check facts, grammar, names and dates.'},{'title':'Tone','text':'Match formality and respect to the situation.'},{'title':'Audience awareness','text':'Adapt detail and vocabulary to the receiver.'},{'title':'Purpose','text':'Make the desired outcome explicit.'},
    ]),
    b('practice','30-second review','Before sending an important message, ask: Is the purpose obvious? Can anything be removed? Is the requested action clear? Is the tone appropriate?',prompt='What I will improve'),
]

PRO_WRITING = [
    b('intro',text='Professional writing is strongest when the reader understands the point quickly and can act without decoding unnecessary language.'),
    b('heading','Replace wordy phrases'),
    b('table',columns=['Wordy','Stronger'],rows=[['at this point in time','now'],['due to the fact that','because'],['in the event that','if'],['with regard to','about'],['has the ability to','can']]),
    b('heading','Prefer active, specific sentences'),
    b('model','Before → after','Before: “The report was reviewed by the team and feedback was provided.” After: “The team reviewed the report and provided feedback.”'),
    b('heading','Build useful paragraphs'),
    b('explain',text='Start with one clear point, add necessary evidence or explanation, then close with the implication or action.'),
    b('heading','Emails, reports and proposals'),
    b('explain',text='Email prioritises action and context; reports prioritise evidence and structure; proposals prioritise the problem, value and requested decision.'),
    b('practice','Rewrite','Rewrite a recent workplace message to make it shorter, more specific and easier to act on.',prompt='My improved message'),
]

SPEAKING = [
    b('intro',text='Confidence in professional speaking comes from structure more than volume. Know your point, support it briefly and stop when the message has landed.'),
    b('explain','Answer in three moves','1) Give the answer first. 2) Add the key reason or evidence. 3) State the implication or next action.'),
    b('model','Example','Question: “Can we launch Friday?” Answer: “Not safely. Two payment tests are still failing. If they pass by Wednesday afternoon, Friday remains possible; otherwise I recommend Monday.”'),
    b('explain','Ask precise questions','Replace broad questions such as “Any updates?” with questions that define the decision needed, owner and time frame.'),
    b('practice','Your turn','Prepare a 30-second response to a difficult question you receive at work or school.',prompt='My response'),
]

MEETINGS = [
    b('intro',text='Good meeting communication makes decisions visible. Strong contributors listen for the decision, contribute relevant evidence and confirm ownership before the meeting ends.'),
    b('explain','Contribute clearly','Use: Context → Point → Evidence → Recommendation. This keeps comments useful and prevents long, unfocused contributions.'),
    b('model','Meeting contribution','“Our attendance dropped 12% after the timetable change. The largest decline is in the 8 a.m. sessions. I recommend we test a 9 a.m. start for two weeks and compare attendance.”'),
    b('explain','Check understanding','Before moving on, restate the decision, owner and deadline: “So Sarah will send the revised draft by Thursday 2 p.m., and we review Friday morning—is that correct?”'),
    b('practice','Meeting habit','Name one meeting habit you will stop and one you will start this week.',prompt='My commitment'),
]

CONCEPTS_FRAMEWORKS = [
    b('intro',text='Conceptualization turns an abstract idea into clearly defined concepts that can be observed, discussed or measured. Frameworks then show how those concepts are expected to relate.'),
    b('heading','Conceptualize the key ideas'),
    b('explain',text='Define each central concept in the specific way your study will use it. Avoid assuming that a familiar word means the same thing to every reader.'),
    b('model','Example','If the study concerns “employee motivation,” state what motivation means in this study and which indicators or experiences will represent it.'),
    b('heading','Use theory deliberately'),
    b('explain',text='A theoretical framework uses an established theory to explain or predict the phenomenon. A conceptual framework maps the study-specific concepts and relationships you will investigate.'),
    b('practice','Framework sketch','Name your main concepts, define each one, and describe the relationship you expect between them.',prompt='My framework notes'),
]

VARIABLES_CONTENT = [
    b('intro',text='Variables are characteristics that can differ across people, organisations, events or time. Clear variables help align objectives, questions, instruments and analysis.'),
    b('explain','Independent and dependent variables','In explanatory quantitative work, an independent variable is treated as a possible influence or predictor, while a dependent variable is the outcome being explained.'),
    b('explain','Other useful variable roles','Control, mediating and moderating variables may help explain alternative influences, mechanisms or conditions under which a relationship changes.'),
    b('apply','Example','If a study asks whether financial literacy influences mobile-loan default, financial literacy may be the predictor and default behaviour the outcome.'),
    b('practice','Identify your variables','List the main concepts in your proposed study and state which ones are outcomes, predictors or contextual factors.',prompt='My variables'),
]

OBJECTIVES_QUESTIONS = [
    b('intro',text='Objectives and research questions translate the problem into a plan for inquiry. Every objective should contribute directly to answering the central problem.'),
    b('heading','General objective'),
    b('explain',text='State the overall purpose of the study in one concise sentence.'),
    b('heading','Specific objectives'),
    b('explain',text='Break the general objective into focused outcomes that can each be investigated with evidence.'),
    b('heading','Research questions'),
    b('explain',text='Turn each specific objective into an answerable question. The wording should signal what evidence is needed.'),
    b('heading','Hypotheses, when appropriate'),
    b('explain',text='Quantitative studies may state testable expectations about relationships or differences. Not every study requires hypotheses.'),
    b('model','Alignment example','Objective: Determine whether financial literacy predicts loan default among informal traders. Question: To what extent does financial literacy predict loan default among informal traders?'),
    b('practice','Alignment check','Write one objective and the research question that directly corresponds to it.',prompt='Objective + question'),
]

RESEARCH_GAP_CONTENT = [
    b('intro',text='A research gap is not simply “few studies exist.” It is the specific unresolved issue that remains after reviewing what credible evidence already shows.'),
    b('explain','Types of gaps','A gap may concern an under-studied population or setting, conflicting findings, weak methods, an outdated evidence base, an untested theory or a practical problem that current studies do not explain.'),
    b('model','Weak vs strong gap','Weak: “There are few studies on digital claims.” Stronger: “Existing studies measure adoption rates but do not explain why verified claimants continue to choose in-person processing despite access to a functioning digital channel.”'),
    b('apply','Connect the gap to the problem','The gap should explain why your study is needed and what new evidence it will add.'),
    b('practice','State your gap','In three sentences: what is known, what remains unresolved, and how your proposed study responds.',prompt='My research gap'),
]

class Command(BaseCommand):
    help = 'Seed the Research Skills & Business Communication platform with the supplied client curriculum.'

    def handle(self, *args, **options):
        research, _ = Course.objects.update_or_create(slug='research-blueprint', defaults={
            'title':'The Research Blueprint','subtitle':'From a rough idea to defensible research writing','description':'A guided system for planning, conducting and writing research through Explain → Model → Practice → Apply.','category':'Academic & Applied Research','accent':'navy','access':'mixed','price':150000,'currency':'UGX','order':1,'is_published':True,
        })
        foundations, _ = Module.objects.update_or_create(course=research, slug='foundations-of-research', defaults={'title':'Foundations of Research','description':'Build the thinking skills behind a defensible research project.','order':1,'is_published':True})
        literature, _ = Module.objects.update_or_create(course=research, slug='literature-review', defaults={'title':'The Literature Review','description':'Summarise, compare and synthesise sources in your own academic voice.','order':2,'is_published':True})
        methodology, _ = Module.objects.update_or_create(course=research, slug='methodology', defaults={'title':'Methodology','description':'Align research design, sampling, data collection, analysis and ethics.','order':3,'is_published':True})

        def lesson(module, slug, title, content, order, *, summary='', duration=15, kind='interactive', free=True, premium=False, quiz=None, refs=None):
            return Lesson.objects.update_or_create(slug=slug, defaults={
                'module':module,'title':title,'summary':summary or (content[0].get('text','') if content else ''),'duration_minutes':duration,'kind':kind,
                'is_free':free,'is_premium':premium,'is_published':True,'order':order,'content':content,'quiz':quiz or [],'references':refs or [],
            })[0]

        lesson(foundations,'what-is-research','What Is Research?',RESEARCH_DEFINITION,1,duration=8,refs=['Creswell, J. W. (2008). Educational research.'])
        lesson(foundations,'why-conduct-research','Why Do People Conduct Research?',PURPOSE_CONTENT,2,duration=14,refs=['Creswell & Creswell (2018)','Kothari (2004)','Verma & Verma (2023)'])
        lesson(foundations,'research-problem','What Is a Research Problem?',RESEARCH_PROBLEM,3,duration=12,quiz=RESEARCH_PROBLEM_QUIZ,refs=['Kothari, C. R. (2004). Research methodology: Methods and techniques.','Sekaran, U. (2003). Research methods for business.'])
        lesson(foundations,'problem-characteristics','Characteristics of a Good Research Problem',CHAR_CONTENT,4,duration=18,refs=['Alvesson & Sandberg (2011)','Creswell & Creswell (2023)','Kumar (2019)'])
        lesson(foundations,'problem-identification','Steps in Identifying a Research Problem',STEPS_CONTENT,5,duration=20,quiz=STEPS_QUIZ,refs=['Kombo & Tromp (2006)','Leedy & Ormrod (2019)'])
        paid_lesson = lesson(foundations,'problem-analysis','Problem Analysis: Four Ways to Diagnose a Research Problem',PROBLEM_ANALYSIS,6,duration=24,free=False,premium=True,quiz=PROBLEM_ANALYSIS_QUIZ,refs=['Castro, Marcos, & Vara (2013)','Collier (2011)','European Commission (2004)'])
        lesson(foundations,'conceptualization-frameworks','Conceptualization and Research Frameworks',CONCEPTS_FRAMEWORKS,7,duration=24)
        lesson(foundations,'research-variables','Understanding Research Variables',VARIABLES_CONTENT,8,duration=20)
        lesson(foundations,'objectives-questions-hypotheses','Objectives, Research Questions and Hypotheses',OBJECTIVES_QUESTIONS,9,duration=26)
        lesson(foundations,'research-gap','Identifying and Stating the Research Gap',RESEARCH_GAP_CONTENT,10,duration=22)
        lesson(foundations,'problem-builder-guide','Research Problem Blueprint Builder — Guide',[
            b('intro',text='Use the builder workspace to combine the source of your problem, one-sentence problem, evidence case, quality check and significance into one working problem statement.'),
            b('cards',items=[{'title':'1. Source','text':'Identify what sparked the problem.'},{'title':'2. One sentence','text':'Narrow the problem by what, who, where and how.'},{'title':'3. Evidence case','text':'Add nature, magnitude, population, duration and place.'},{'title':'4. Quality check','text':'Score the draft against the characteristics of a strong problem.'},{'title':'5. Significance','text':'State what the study will add and who should care.'}]),
        ],11,duration=10,kind='builder')
        lesson(foundations,'chapter-one-builder-guide','Chapter One Scaffold — Guide',[
            b('intro',text='The Chapter One Builder consolidates the background, problem statement, purpose, objectives, questions, scope, significance, framework and research gap into one structured working chapter.'),
            b('practice','Before you open the builder','Check that your research problem is specific, evidence-backed and clearly scoped. Then gather the citations you expect to use in the background and gap.',prompt='My preparation notes'),
        ],12,duration=12,kind='builder')

        lesson(literature,'literature-review-method','The Four-Layer Literature Review Method',LIT_REVIEW,1,duration=35)
        lesson(literature,'source-synthesis','From Source Notes to Synthesis',SOURCE_SYNTHESIS,2,duration=28)
        lesson(literature,'literature-builder-guide','Literature Review Scaffold — Guide',[
            b('intro',text='The literature builder helps you organise themes, source notes, synthesis and the unresolved gap without writing the argument for you.'),
            b('practice','Prepare your theme map','List three themes in your literature and the key sources that belong under each.',prompt='Theme map'),
        ],3,duration=12,kind='builder')
        lesson(methodology,'methodology-foundations','Methodology Foundations',METHODOLOGY,1,duration=32)

        Resource.objects.update_or_create(slug='problem-analysis', defaults={
            'title':'Problem Analysis: Four Ways to Diagnose a Research Problem','summary':'A premium diagnostic module with four paths, worked examples, citations, practice prompts and a knowledge check.','access':'paid','price':35000,'currency':'UGX','lesson':paid_lesson,'preview':[
                {'title':'Four diagnostic paths','text':'Condition-Based, Process-Based, Historical/Narrative and Comparative/Disparity-Based.'},
                {'title':'Applied learning','text':'Each path includes explanation, academic framing, a practical example and a learner exercise.'},
                {'title':'Knowledge check','text':'Finish with scenario-based questions that test whether you can choose the correct diagnostic path.'},
            ],'is_published':True,'order':1,
        })
        Resource.objects.update_or_create(slug='research-quality-checklist', defaults={'title':'Research Quality Checklist','summary':'A free one-page digital checklist for reviewing a research problem before you commit to it.','access':'free','price':0,'currency':'UGX','preview':[{'title':'Scope','text':'Is it manageable and clearly bounded?'},{'title':'Evidence','text':'Can the problem be investigated with available evidence?'},{'title':'Significance','text':'Will the findings matter to a defined audience?'}],'is_published':True,'order':2})
        Resource.objects.update_or_create(slug='communication-review-card', defaults={'title':'30-Second Communication Review','summary':'A free review card for checking clarity, action, tone and conciseness before you send an important message.','access':'free','price':0,'currency':'UGX','preview':[{'title':'Purpose','text':'Is the reason for the message obvious?'},{'title':'Action','text':'Does the receiver know what to do next?'},{'title':'Tone','text':'Is the language appropriate for the audience?'}],'is_published':True,'order':3})

        comm, _ = Course.objects.update_or_create(slug='business-communication-toolkit', defaults={
            'title':'Business Communication Toolkit','subtitle':'Clearer writing. Stronger speaking. Better workplace decisions.','description':'Practical, before-and-after training for the real situations where professional communication matters.','category':'Professional Communication','accent':'teal','access':'free','price':0,'currency':'UGX','order':2,'is_published':True,
        })
        m1,_=Module.objects.update_or_create(course=comm,slug='effective-workplace-communication',defaults={'title':'Principles of Effective Workplace Communication','description':'Clarity, conciseness, completeness, correctness, tone, audience and purpose.','order':1,'is_published':True})
        m2,_=Module.objects.update_or_create(course=comm,slug='professional-writing',defaults={'title':'Professional Writing','description':'Vocabulary, sentence strength, paragraphs, email, reports and proposals.','order':2,'is_published':True})
        m3,_=Module.objects.update_or_create(course=comm,slug='speaking-with-confidence',defaults={'title':'Speaking With Confidence','description':'Ask and answer with precision, structure and composure.','order':3,'is_published':True})
        m4,_=Module.objects.update_or_create(course=comm,slug='effective-meetings',defaults={'title':'Communicating Effectively in Meetings','description':'Contribute clearly, present evidence and confirm decisions.','order':4,'is_published':True})
        lesson(m1,'communication-principles','The Seven Principles of Effective Workplace Communication',COMM_PRINCIPLES,1,duration=22)
        lesson(m2,'professional-writing','Professional Writing: Clear, Concise and Actionable',PRO_WRITING,1,duration=30)
        lesson(m3,'speaking-with-confidence','Speaking With Confidence',SPEAKING,1,duration=24)
        lesson(m4,'communicating-in-meetings','Communicating Effectively in Meetings',MEETINGS,1,duration=24)

        self.stdout.write(self.style.SUCCESS('Platform content seeded successfully.'))
