# Titre

Mon approche de l'IA est hybride: à la fois curieux des progrès en Machine Learning (ML) de ces dernières années grâce au deep learning tout en restant très critique vis-à-vis de cette technique;
 je continue de m'intéresser de près à tout ce qui touche aux neurosciences, à la psychologie et à la philosophie.

 
## Critiques du ML

Ma principale critique vis-à-vis du ML et des réseaux de neurones artificiels est, pour l'instant, leur extrême rigidité: [l'architecture du réseau est toujours figée](ArchitectureFigée), généralement designée par un humain qui
 va ensuite lancer l'optimisation du modèle afin de maximiser/minimiser une fonction d'objectif en le nourrissant de milliers, de millions voire de milliards de données (le dataset).
Chaque fois qu'on va vouloir modifier la structure du réseau, il va falloir lui faire réapprendre tout depuis le début.
Parfois on peut prendre un modèle entraîné et l'adapter à un nouveau dataset (fine tuning), en gros on part d'un point d'équilibre dans un optimum local (ou global!) pour reprendre l'entraînement sur un nouvel
 ensemble de données afin de rendre le modèle tolérant à de nouveaux exemples qu'il n'avait pas vus auparavant.

Cela reste malgré tout un processus extrêmement lourd, qui consomme énormément de données, de temps et d'énergie et qui se révèle très peu flexible. On constate de plus assez souvent une incapacité à s'adapter
 à de nouvelles situations non rencontrées durant l'apprentisasge (out of distribution data), et ces réseaux sont capables de tâches extrêmement réduites (on parle de narrow AI), même s'il on peut difficilement
 considérer la maîtrise du langage par certains modèles comme étant une tâche réduite.

### Illusion de personnalité

Je ne crois pas non plus à l'émergence de la conscience ou de la "sentience" simplement en continuant d'augmenter le nombre de paramètres des modèles de neural networks actuels,
 même si certains commencent à sérieusement se poser la question au vu des derniers progrès des Large Language Models (LLM) comme GPT-3 ou Lambda.
Mon opinion sur le sujet est simplement que ces modèles sont entraînés sur de gigantesques corpus de texte mettant en scène des interactions entre humains, dans des situations réelles et crédibles,
 il en ressort évidemment **forcément** des choses qui peuvent amener à penser qu'on a affaire à une vraie personne, dans une situation réelle et crédble.
 Pourtant, il ne s'agit ni plus ni moins ici qu'une illusion de personnalité:
 la machine recrée simplement une conversation plausible, dans laquelle on retrouve néanmoins des indices qu'il s'agit là d'une simulation; c'est le cas par exemple quand la machine répond
 sans sourciller qu'elle prend beaucoup de plaisir quand elle est entourée de ses amis et de sa famille. Elle joue la comédie. Elle fait semblant d'être un humain, et c'est déjà très convaincant!

On notera que ce genre de "tromperie" a déjà été employée par le passé pour faire passer le Turing test à plusieurs chat bots, notamment celui qui simulait le fait d'être un gamin de 13 ans pour excuser
 le fait qu'il répondait souvent n'importe quoi aux questions qu'on lui posait... (??? source)

On reconnaît donc là un jeu d'acteur, un peu à la manière dont les psychopathes simulent les émotions humaines afin de se faire passer (souvent avec succès) pour d'authentiques être humains animés de sentiments.


## Concentration sur le langage et la manipulation de symboles

C'est ma conviction profonde que le langage et la manipulation de symboles/concepts sont la clé de l'intelligence humaine.

Le langage, tout particulièrement, est notre façon typiquement humaine de véhiculer nos idées. Le sens des mots peut **généralement** être directement lié à un *concept*, et les concepts sont les éléments
clés sur lesquels est articulée l'intégralité de notre être.

Par la suite, dans ce blog, on ne parlera pas des mots sans distinguer le fait qu'ils n'ont qu'un seul *sens*, et à chaque *sens* on associera un seul et unique *concept*.
Les 2 mots, sens et concept, sont les 2 faces d'une seule et même pièce.

Même quand un mot est polysémantique, ou quand on rencontre des homonymes, je voudrai toujours parler d'un seul sens particulier, de manière totalement non-ambiguë!
(c'est d'ailleurs une autre critique que je ferais volontiers aux language models actuels: il semblerait qu'lis ne fassent absolument pas de distinction sémantique entre les homonymes! Cf. ma critique sur [Word2Vec](../ProblèmeWord2Vec))

### Les symboles dans le règne animal

Il est très probable que de nombreuses espèces animales évoluées savent maîtriser les symboles et réfléchissent de manière symbolique pour représenter les choses auxquelles elles sont confrontées au quotidien:
 nourriture, proie, prédateur, troupeau, le temps qu'il fait, de vagues notions de distance et de quantité, etc. mais seuls les humains, à notre connaissance,
 ont appris à se baser sur ces symboles afin de [construire des concepts plus complexes](GroupementConcepts) et surtout, ont accolé un langage pour exprimer ces concepts, ainsi qu'une langue pour communiquer
 ces concepts avec leurs congénères.

### Le langage comme outil pour articuler les symboles et les concepts

J'aimerais faire la distinction entre le langage signifiant et la langue parlée: le langage donne des règles pour articuler les concepts entre eux, il est (probablement) universel dans sa construction, tandis que la langue
 est une façon bien particulière d'exprimer le langage, elle possède son vocabulaire et ses règles propres qui changent d'une peuplade ou d'une région à l'autre.

Un exemple d'utilisation du langage universel:

	<un homme> <fait une action> <sur un objet>

Peu importe la façon dont on encode &lt;un homme&gt;, l'&lt;action&gt; ou l'&lt;objet&gt; dans une langue ou une autre, il est même probable qu'ils existe des langues qui n'ont aucune représentation exacte pour l'un ou 
 l'autre des termes de cette phrase (par manque de vocabulaire, ou même manque du concept), il est toujours possible de décrire l'homme, l'action qui est faite et l'objet en présence.
Au pire en employant une longue et difficile périphrase.

