# Illusion de personnalité

Récemment (printemps 2022), on a vu fleurir quelques articles de presse concernant les préoccupations de certains ingénieurs de chez Google 
 à propos de la soi-disant "sentience" d'un chatbot nommé "[LaMDA](https://blog.google/technology/ai/lamda/)" [^1] [^2].

Je ne crois pas du tout à l'émergence de la conscience ou de la "sentience" simplement en continuant d'augmenter le nombre de paramètres des modèles de neural networks actuels,
 même si certaines personnes commencent à sérieusement se poser la question au vu des derniers progrès des Large Language Models (LLM) comme GPT-3 ou Lambda.
Mon opinion sur le sujet est simplement que ces modèles sont entraînés sur de gigantesques corpus de texte mettant en scène des interactions entre humains, dans des situations réelles et crédibles,
 il en ressort évidemment **forcément** des choses qui peuvent amener à penser qu'on a affaire à une vraie personne, dans une situation réelle et crédible.

## La comédie humaine

Pourtant, il ne s'agit ni plus ni moins ici qu'une illusion de personnalité :<br>
 la machine recrée simplement une conversation plausible, dans laquelle on trouve généralement des indices du fait qu'il s'agit là uniquement d'une simulation; c'est le cas par exemple quand la machine répond
 sans sourciller qu'elle prend beaucoup de plaisir quand elle est entourée de ses amis et de sa famille :expressionless:.
 
Elle joue la comédie ! Elle endosse le rôle d'un être un humain et c'est apparemment très convaincant !

On notera que ce genre de "tromperie" a déjà été employée par le passé pour faire passer le [Turing Test](https://en.wikipedia.org/wiki/Turing_test) à plusieurs chat bots,
 notamment [celui qui s'est fait passer pour un gamin de 13 ans](https://www.theguardian.com/technology/2014/jun/08/super-computer-simulates-13-year-old-boy-passes-turing-test) afin d'excuser le fait qu'il répondait souvent n'importe quoi aux questions qu'on lui posait...

On reconnaît donc là un jeu d'acteur, un peu à la manière dont les psychopathes simulent les émotions humaines afin de se faire passer (souvent avec succès) pour des humains animés d'authentiques sentiments.

> :bulb: On notera toutefois un intérêt à cette anecdote LaMDA : il n'y a, a priori, *pas besoin de conscience* pour donner l'illusion de conscience !<br>
> C'est effectivement très étonnant que nous soyions trompés si aisément par des procédés aussi grossiers que le mensonge et le trucage ! (ça explique probablement pourquoi les politiciens s'en sortent aussi facilement ?)<br>
> Une sorte de [paréidolie](https://fr.wikipedia.org/wiki/Par%C3%A9idolie) linguistique qui nous ferait voir des humains à n'importe quel prix ?
> ![Paréidolie](https://www.grapheine.com/wp-content/uploads/2015/04/4681816734_615888029b_b-e1595852101918.jpg)


## Émergence à partir de règles simples

J'ai longtemps cru à l'émergence d'un comportement complexe à partir de règles simples. Cela arrive parfois mais *1)* au prix de beaucoup de tuning très précis et *2)* les comportements ne sont jamais *réellement complexes*,
 en tout cas pas au point où, miraculeusement, on aurait créé la vie intelligente !

Ce genre d'entreprises (i.e. partir de l'infiniment petit pour arriver au macroscopique [^3]) sont généralement vouées à l'échec, et même si l'on parvenait hypothétiquement à découvrir **la** règle ultime qui donne naissance à la vie et,
 (beaucoup) plus tard, à des organismes complexes et intelligents comme les êtres humains, alors on aura sans doute besoin d'une énorme machinerie et de beaucoup de temps pour arriver à ce stade.</br>
D'ailleurs ça existe déjà : ça s'appelle l'Univers!


## Un algorithme limité

Une autre objection que je pourrais formuler à la décharge de l'émergence de la conscience dans les modèles de réseaux de neurones profonds est que, pour le moment, ils sont conçus *1)* de manière rigide (cf. ma [critique de la rigidité des réseaux](../ArchitectureFixe))
et *2)* uniquement destinés à encoder un seul type d'algorithme !<br>
Pour certains, ça sera la classification d'images, pour d'autres la prédiction de la suite d'un texte à partir d'une graine initiale, etc.

Mais ils ne savent rien faire d'autre que l'algorithme qu'on leur a ordonné d'exécuter et qu'on aura rempli avec un ensemble gigantesque de paramètres (à l'heure où j'écris, on en est à plusieurs centaines de milliards pour les LLM) !

Même si cet algorithme est très complexe, qu'il possède de nombreuses feedback loops qui lui confèrent un côté chaotique, récurrent et non-linéaire indéniables, il ne sortira certainement jamais du cadre qui lui a été fixé.<br>
Dans le cas des Large Language Models, ça sera uniquement de prédire le texte le plus crédible pour un interlocuteur humain à partir de ce qu'on aura écrit juste avant (la taille du contexte est d'ailleurs encore extrêmement limitée).


## Le cerveau est multi-usages

On s'aperçoit aisément que ces language models sont incapables de raisonnements logiques ou même d'encoder les relations entre les objets : ils ne peuvent pas compter, ils ne peuvent pas savoir ce que ressent un humain,
 ils ne savent pas comment qui est pour moi la mère de ma cousine, sauf s'ils ont déjà "lu" la réponse quelque part...<br>
Et c'est _normal_ ! Car tous ces concepts (comptage, relations, sentiments) sont implémentés par des *processus* totalement différents de la simple mémorisation statistique à la base de ces language models.

Il est assez clair que le cerveau utilise ses réseaux de neurones pour implémenter de nombreux algorithmes qui peuvent changer et se reconfigurer à volonté,
 c'est d'ailleurs fascinant de réaliser que le cerveau est à la fois une mémoire, un processeur de données et son propre programmeur qui ré-écrit ses processeurs et les pilote pour les agencer en des séquences
 découlant elle-mêmes d'un apprentisage antérieur !


???:warning: TODO: programmeur inconscient (recâblage auto du network, plasticité) **ET** conscient (on choisit de réfléchir à qqchose et résoudre un problème en monopolisant des processus particuliers, i.e. raisonnement & réflexion)!


Il est donc indispensable d'effectuer un changement de paradigme radical sur notre façon d'architecturer les réseaux de neurones artificiels !


[^1]: https://www.theguardian.com/technology/2022/jul/23/google-fires-software-engineer-who-claims-ai-chatbot-is-sentient
[^2]: https://www.youtube.com/watch?v=iBouACLc-hw
[^3]: https://www.epfl.ch/research/domains/bluebrain/
