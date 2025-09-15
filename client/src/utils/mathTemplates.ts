export interface MathTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity_level: number;
  topic_type: 'mathematical';
  template_content: {
    overview: string;
    position_for: string;
    position_against: string;
    key_equations?: string[];
    proof_structure?: string;
    references?: string[];
  };
}

export const mathTemplates: MathTemplate[] = [
  {
    id: 'fundamental-theorem-calculus',
    title: 'The Fundamental Theorem of Calculus',
    description: 'Debate the significance and applications of the Fundamental Theorem of Calculus in mathematics',
    category: 'Analysis',
    complexity_level: 7,
    topic_type: 'mathematical',
    template_content: {
      overview: `# The Fundamental Theorem of Calculus

The Fundamental Theorem of Calculus establishes the relationship between differentiation and integration:

$$\\int_a^b f'(x)dx = f(b) - f(a)$$

This theorem is often considered one of the most important results in calculus.

## Key Questions for Debate:
- Is this the most fundamental result in analysis?
- Should this be taught as the starting point for calculus?
- Does this theorem deserve its "fundamental" status?`,

      position_for: `# Arguments FOR the Fundamental Nature

## 1. Unifies Two Major Operations
The theorem elegantly connects differentiation and integration, showing they are inverse operations.

$$\\frac{d}{dx}\\int_a^x f(t)dt = f(x)$$

## 2. Practical Computational Power
- Enables efficient evaluation of definite integrals
- Foundation for numerical integration methods
- Critical for solving differential equations

## 3. Theoretical Significance
- Bridges geometric and algebraic concepts
- Fundamental to measure theory
- Essential for advanced analysis

## 4. Historical Impact
- Revolutionized mathematical analysis
- Enabled the development of physics and engineering
- Created the foundation for modern calculus`,

      position_against: `# Arguments AGAINST the "Fundamental" Status

## 1. Requires Strong Prerequisites
- Needs rigorous definition of integration
- Assumes continuity conditions
- Built on complex measure theory foundations

## 2. Limited Scope
- Only applies to well-behaved functions
- Breaks down for discontinuous functions
- Restricted to one-dimensional case initially

## 3. Alternative Formulations Exist
- Stokes' theorem is more general
- Green's theorem covers similar ground
- Divergence theorem extends the concept

## 4. Historical Perspective
- Developed after integral calculus was established
- More of a connecting result than foundational
- Other theorems have broader applications`,

      key_equations: [
        '\\int_a^b f\'(x)dx = f(b) - f(a)',
        '\\frac{d}{dx}\\int_a^x f(t)dt = f(x)',
        'F(x) = \\int_a^x f(t)dt',
        'F\'(x) = f(x)'
      ],

      proof_structure: `## Proof Structure Template

1. **Given**: Continuous function f on [a,b]
2. **Define**: F(x) = ∫ₐˣ f(t)dt
3. **Show**: F'(x) = f(x)
4. **Method**: Use limit definition of derivative
5. **Conclusion**: Integration and differentiation are inverse operations`,

      references: [
        'Spivak, M. "Calculus" - Chapter on Integration',
        'Rudin, W. "Principles of Mathematical Analysis"',
        'Apostol, T. "Mathematical Analysis"'
      ]
    }
  },

  {
    id: 'riemann-hypothesis',
    title: 'The Riemann Hypothesis',
    description: 'Examine the significance and potential impact of the Riemann Hypothesis on number theory',
    category: 'Number Theory',
    complexity_level: 10,
    topic_type: 'mathematical',
    template_content: {
      overview: `# The Riemann Hypothesis

The Riemann Hypothesis concerns the zeros of the Riemann zeta function:

$$\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}$$

**Hypothesis**: All non-trivial zeros of ζ(s) have real part equal to 1/2.

## Debate Focus:
- Should this be the highest priority in mathematics?
- What would proof/disproof mean for mathematics?
- Is the hypothesis even true?`,

      position_for: `# Arguments FOR Priority Status

## 1. Profound Connections
- Links to prime number distribution
- Central to analytic number theory
- Connects analysis and discrete mathematics

## 2. Broad Implications
- Over 1000 theorems depend on RH
- Would revolutionize our understanding of primes
- Applications to cryptography and computer science

## 3. Mathematical Beauty
$$\\pi(x) \\sim \\frac{x}{\\ln x} + O(\\sqrt{x}\\ln x)$$

## 4. Clay Millennium Prize
- One of seven $1M problems
- Recognized importance by mathematical community`,

      position_against: `# Arguments AGAINST Priority Focus

## 1. Purely Theoretical
- No immediate practical applications
- Resources could go to applied mathematics
- May not impact daily mathematical work

## 2. Computational Evidence Limitations
- Verified only for limited ranges
- Could be false for very large values
- Pattern might break eventually

## 3. Alternative Important Problems
- P vs NP has more practical implications
- Climate modeling needs attention
- Medical mathematics could save lives

## 4. Historical Precedent
- Many "obvious" conjectures have been false
- Fermat's Last Theorem took 350 years
- May be undecidable`,

      key_equations: [
        '\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}',
        '\\zeta(s) = \\prod_p \\frac{1}{1-p^{-s}}',
        '\\pi(x) \\sim \\frac{x}{\\ln x}',
        '\\zeta(\\frac{1}{2} + it) = 0'
      ],

      proof_structure: `## Approaches to the Hypothesis

1. **Analytic Continuation**: Extend ζ(s) to entire complex plane
2. **Functional Equation**: Use symmetry properties
3. **Zero Distribution**: Study spacing and location
4. **Computational Verification**: Check specific cases
5. **Equivalent Formulations**: Prime counting functions`,

      references: [
        'Edwards, H. "Riemann\'s Zeta Function"',
        'Titchmarsh, E. "The Theory of the Riemann Zeta-Function"',
        'Bombieri, E. "The Riemann Hypothesis - Clay Institute"'
      ]
    }
  },

  {
    id: 'infinity-paradoxes',
    title: 'Mathematical Infinity and Its Paradoxes',
    description: 'Debate the nature and treatment of infinity in mathematics',
    category: 'Foundations',
    complexity_level: 8,
    topic_type: 'mathematical',
    template_content: {
      overview: `# Mathematical Infinity and Its Paradoxes

Infinity appears throughout mathematics but creates logical puzzles:

$$|\\mathbb{N}| = |\\mathbb{Q}| < |\\mathbb{R}|$$

## Central Questions:
- Is infinity a legitimate mathematical object?
- How should we handle infinite sets and processes?
- Do Cantor's results make sense?`,

      position_for: `# Arguments FOR Infinity as Legitimate

## 1. Cantor's Theory is Consistent
- Set theory provides rigorous foundation
- Different sizes of infinity are well-defined
- No logical contradictions in ZFC

$$\\aleph_0 < \\aleph_1 < \\aleph_2 < ...$$

## 2. Essential for Analysis
- Limits require infinite processes
- Real numbers need infinite decimals
- Integration uses infinite sums

## 3. Practical Applications
- Computer science uses infinite structures
- Physics models with infinite space
- Statistics uses infinite populations

## 4. Beautiful Mathematical Results
- Cantor's diagonal argument
- Infinite hotel paradox has clear resolution
- Enables elegant theorems`,

      position_against: `# Arguments AGAINST Infinity

## 1. Philosophical Problems
- Cannot physically exist
- Leads to counterintuitive results
- Violates common sense

## 2. Historical Paradoxes
- Russell's paradox
- Banach-Tarski paradox
- Galileo's paradox: parts equal the whole

## 3. Finitist Alternative
- Mathematics should be constructive
- Finitary methods are more reliable
- Computational mathematics is finite

## 4. Logical Concerns
- Axiom of Choice is questionable
- Continuum hypothesis is undecidable
- May hide contradictions`,

      key_equations: [
        '|\\mathbb{N}| = \\aleph_0',
        '|\\mathbb{R}| = 2^{\\aleph_0}',
        '\\lim_{n \\to \\infty} f(n)',
        '\\sum_{n=1}^{\\infty} a_n'
      ],

      proof_structure: `## Analysis Framework

1. **Define**: What we mean by "infinity"
2. **Historical Context**: Ancient to modern views
3. **Formal Systems**: ZFC set theory treatment
4. **Paradox Resolution**: How math handles contradictions
5. **Philosophical Implications**: What this means for mathematics`,

      references: [
        'Cantor, G. "Über eine Eigenschaft des Inbegriffes"',
        'Moore, A.W. "The Infinite"',
        'Rucker, R. "Infinity and the Mind"'
      ]
    }
  },

  {
    id: 'proof-by-contradiction',
    title: 'The Validity of Proof by Contradiction',
    description: 'Examine whether proof by contradiction should be accepted as valid mathematical reasoning',
    category: 'Logic & Foundations',
    complexity_level: 6,
    topic_type: 'mathematical',
    template_content: {
      overview: `# Proof by Contradiction (Reductio ad Absurdum)

Proof by contradiction assumes the negation of what we want to prove, then derives a contradiction:

**Structure**: To prove P, assume ¬P and derive a contradiction, therefore P must be true.

## Famous Example:
Prove $\\sqrt{2}$ is irrational.

## Debate Questions:
- Is this logically valid?
- Should constructive mathematics reject it?
- Are there alternatives?`,

      position_for: `# Arguments FOR Proof by Contradiction

## 1. Logical Validity
- Based on law of excluded middle: P ∨ ¬P
- Modus tollens: if A→B and ¬B, then ¬A
- Fundamental principle of classical logic

## 2. Mathematical Necessity
- Some theorems seem to require it
- Euclid's proof of infinite primes
- Irrationality of √2

$$\\text{Assume } \\sqrt{2} = \\frac{p}{q} \\text{ in lowest terms} \\Rightarrow \\text{contradiction}$$

## 3. Historical Success
- Used successfully for 2000+ years
- Foundation of many mathematical results
- No known contradictions from proper use

## 4. Elegance and Power
- Often provides clearest proof path
- Can handle existence proofs efficiently
- Natural reasoning pattern`,

      position_against: `# Arguments AGAINST Proof by Contradiction

## 1. Constructivist Objections
- Doesn't provide explicit construction
- Based on questionable logical principles
- Law of excluded middle may not hold for all statements

## 2. Computational Limitations
- Non-constructive proofs don't give algorithms
- Cannot extract computational content
- Less useful for computer science applications

## 3. Philosophical Problems
- Assumes reality of abstract mathematical objects
- May lead to acceptance of non-existent entities
- Circular reasoning concerns

## 4. Alternative Methods Exist
- Direct proof is more informative
- Constructive alternatives often available
- Intuitionistic logic provides framework

$$\\text{Constructive proof of } \\sqrt{2} \\text{ irrationality possible}$$`,

      key_equations: [
        'P \\lor \\neg P \\text{ (Law of Excluded Middle)}',
        '(\\neg P \\rightarrow \\bot) \\rightarrow P',
        '\\neg \\neg P \\leftrightarrow P \\text{ (Classical Logic)}',
        '\\sqrt{2} \\neq \\frac{p}{q} \\text{ for integers } p,q'
      ],

      proof_structure: `## Analysis Framework

1. **Classical Logic**: Examine underlying logical principles
2. **Historical Examples**: Review famous contradiction proofs
3. **Constructive Alternatives**: Show direct proof methods
4. **Philosophical Implications**: What does acceptance mean?
5. **Modern Applications**: Role in computer science and constructive math`,

      references: [
        'Bridges, D. "Constructive Functional Analysis"',
        'Dummett, M. "Elements of Intuitionism"',
        'van Dalen, D. "Logic and Structure"'
      ]
    }
  },

  {
    id: 'mathematical-beauty',
    title: 'The Role of Beauty in Mathematical Truth',
    description: 'Debate whether mathematical beauty is a guide to truth or merely aesthetic preference',
    category: 'Philosophy of Mathematics',
    complexity_level: 5,
    topic_type: 'mathematical',
    template_content: {
      overview: `# Mathematical Beauty and Truth

Many mathematicians speak of "beautiful" theorems and "elegant" proofs. Consider Euler's identity:

$$e^{i\\pi} + 1 = 0$$

## Central Questions:
- Is mathematical beauty objective or subjective?
- Should beauty guide mathematical research?
- Does beauty indicate truth?`,

      position_for: `# Arguments FOR Beauty as Truth Indicator

## 1. Historical Correlation
- Beautiful theories often prove correct
- Einstein's relativity was considered beautiful before confirmation
- Symmetry leads to conservation laws

## 2. Evolutionary Argument
- Our sense of beauty evolved to recognize patterns
- Pattern recognition aids survival
- Mathematical beauty may detect deep truths

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

## 3. Unification and Simplicity
- Beautiful mathematics connects disparate areas
- Simple, elegant formulations often most general
- Beauty reflects underlying mathematical structure

## 4. Practical Success
- Beautiful mathematics finds unexpected applications
- Group theory, complex analysis prove useful
- Abstract beauty becomes concrete utility`,

      position_against: `# Arguments AGAINST Beauty as Guide

## 1. Cultural Relativity
- Beauty standards vary across cultures
- Mathematical aesthetic is learned, not innate
- Personal preference, not objective truth

## 2. Historical Counterexamples
- Many "ugly" results are important
- Some beautiful theories proved false
- Aesthetics can mislead research

## 3. Logical Independence
- Truth is about logical validity
- Beauty is emotional/psychological response
- Mathematical correctness independent of appeal

$$\\text{Ugly but true: } \\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$

## 4. Research Bias
- Focus on beauty may ignore important problems
- Practical applications often "inelegant"
- Could limit mathematical exploration`,

      key_equations: [
        'e^{i\\pi} + 1 = 0 \\text{ (Euler\'s Identity)}',
        '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}',
        'F = ma \\text{ (Simple, beautiful, true)}',
        '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}'
      ],

      proof_structure: `## Analysis Framework

1. **Define Beauty**: What makes mathematics beautiful?
2. **Historical Cases**: Examine beautiful vs ugly but important results
3. **Psychological Factors**: Why do humans find patterns beautiful?
4. **Practical Implications**: How should beauty influence research?
5. **Philosophical Conclusion**: Relationship between aesthetics and truth`,

      references: [
        'Hardy, G.H. "A Mathematician\'s Apology"',
        'Rota, G.-C. "The Phenomenology of Mathematical Beauty"',
        'Sinclair, N. "Mathematics and Beauty"'
      ]
    }
  }
];

export const getMathTemplateById = (id: string): MathTemplate | undefined => {
  return mathTemplates.find(template => template.id === id);
};

export const getMathTemplatesByCategory = (category: string): MathTemplate[] => {
  return mathTemplates.filter(template => template.category === category);
};

export const getMathTemplatesByComplexity = (level: number): MathTemplate[] => {
  return mathTemplates.filter(template => template.complexity_level === level);
};

export const getAllMathCategories = (): string[] => {
  return Array.from(new Set(mathTemplates.map(template => template.category)));
};