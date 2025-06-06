/**
 * API para gerenciamento de posts do blog
 */
import apiClient from './apiClient';

// Dados mock para quando a API não estiver disponível
const mockPosts = [
  {
    id: '1',
    title: 'Como perder peso de forma saudável',
    excerpt: 'Descubra estratégias eficazes para perder peso sem comprometer sua saúde.',
    content: `
# Como perder peso de forma saudável

Perder peso de forma saudável é um objetivo comum para muitas pessoas. No entanto, é importante abordar esse objetivo com uma mentalidade equilibrada e estratégias baseadas em evidências científicas.

## Princípios fundamentais

1. **Déficit calórico sustentável**: Criar um déficit calórico moderado (cerca de 500 calorias por dia) é mais eficaz e sustentável do que dietas restritivas.

2. **Alimentação balanceada**: Priorize alimentos integrais, proteínas magras, gorduras saudáveis e muitas frutas e vegetais.

3. **Atividade física regular**: Combine exercícios aeróbicos e de resistência para maximizar a queima de gordura e preservar a massa muscular.

4. **Hidratação adequada**: Beber água suficiente ajuda no metabolismo e pode reduzir a fome.

5. **Sono de qualidade**: Dormir bem é essencial para regular os hormônios relacionados à fome e ao metabolismo.

## Estratégias práticas

- **Planeje suas refeições**: Preparar refeições com antecedência ajuda a evitar escolhas impulsivas.
- **Controle as porções**: Use pratos menores e aprenda a reconhecer porções adequadas.
- **Coma conscientemente**: Preste atenção aos sinais de fome e saciedade do seu corpo.
- **Estabeleça metas realistas**: Metas pequenas e alcançáveis mantêm a motivação.
- **Monitore seu progresso**: Acompanhe não apenas o peso, mas também medidas corporais e níveis de energia.

Lembre-se: a consistência é mais importante que a perfeição. Pequenas mudanças sustentáveis ao longo do tempo levam a resultados duradouros.
    `,
    image_url: 'https://images.unsplash.com/photo-1535914254981-b5012eebbd15',
    category: 'Emagrecimento',
    author: 'Dr. Ana Silva',
    created_at: '2025-05-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Nutrição para ganho de massa muscular',
    excerpt: 'Aprenda como alimentar seu corpo adequadamente para maximizar seus ganhos musculares.',
    content: `
# Nutrição para ganho de massa muscular

A nutrição adequada é tão importante quanto o treinamento quando o objetivo é ganhar massa muscular. Sem os nutrientes certos, seu corpo não terá os recursos necessários para construir novos tecidos musculares.

## Princípios fundamentais

1. **Superávit calórico**: Consumir mais calorias do que você gasta é essencial para o ganho de massa.

2. **Proteína suficiente**: Consuma entre 1,6 a 2,2g de proteína por kg de peso corporal para otimizar a síntese proteica muscular.

3. **Carboidratos estratégicos**: Carboidratos fornecem energia para treinos intensos e ajudam na recuperação muscular.

4. **Gorduras saudáveis**: Essenciais para a produção hormonal, incluindo testosterona.

5. **Timing nutricional**: A distribuição dos nutrientes ao longo do dia, especialmente em torno dos treinos, pode otimizar os resultados.

## Alimentos recomendados

### Fontes de proteína:
- Peito de frango
- Carne bovina magra
- Ovos
- Whey protein
- Peixe
- Laticínios

### Fontes de carboidratos:
- Arroz
- Batata-doce
- Aveia
- Frutas
- Legumes

### Fontes de gorduras saudáveis:
- Abacate
- Azeite de oliva
- Oleaginosas
- Sementes

Lembre-se que a consistência é fundamental. Resultados significativos de hipertrofia muscular geralmente levam tempo e exigem dedicação tanto na academia quanto na cozinha.
    `,
    image_url: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2',
    category: 'Nutrição',
    author: 'Prof. Carlos Mendes',
    created_at: '2025-05-20T14:30:00Z'
  },
  {
    id: '3',
    title: 'Treino HIIT para queima de gordura',
    excerpt: 'Conheça os benefícios do treinamento intervalado de alta intensidade para acelerar seu metabolismo.',
    content: `
# Treino HIIT para queima de gordura

O Treinamento Intervalado de Alta Intensidade (HIIT) se tornou uma das formas mais eficientes de exercício para queima de gordura e melhora do condicionamento físico.

## O que é HIIT?

HIIT consiste em alternar entre períodos curtos de exercício intenso e períodos de recuperação ativa ou descanso. Esta abordagem maximiza a queima calórica em um tempo reduzido e promove o efeito EPOC (Excess Post-exercise Oxygen Consumption), onde seu corpo continua queimando calorias mesmo após o término do treino.

## Benefícios do HIIT

1. **Eficiência de tempo**: Resultados significativos em sessões de 20-30 minutos
2. **Maior queima calórica**: Tanto durante quanto após o exercício
3. **Preservação muscular**: Menos catabolismo muscular comparado ao cardio tradicional
4. **Melhora cardiovascular**: Aumento da capacidade aeróbica
5. **Adaptabilidade**: Pode ser realizado com diversos exercícios e equipamentos

## Exemplo de treino HIIT

### Aquecimento (5 minutos)
- Mobilidade articular
- Exercícios leves para elevar a frequência cardíaca

### Circuito principal (20 minutos)
Realize cada exercício por 40 segundos em alta intensidade, seguido por 20 segundos de descanso. Complete 4 rounds do circuito.

1. Burpees
2. Mountain climbers
3. Jumping jacks
4. Agachamento com salto
5. Prancha com toque no ombro

### Desaquecimento (5 minutos)
- Caminhada leve
- Alongamentos estáticos

Para melhores resultados, realize treinos HIIT 2-3 vezes por semana, intercalados com dias de descanso ou treinos de força.
    `,
    image_url: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e',
    category: 'Treino',
    author: 'Treinador Paulo Oliveira',
    created_at: '2025-05-25T09:15:00Z'
  },
  {
    id: '4',
    title: 'Importância do sono para recuperação muscular',
    excerpt: 'Descubra como o sono adequado pode potencializar seus resultados na academia.',
    content: `
# Importância do sono para recuperação muscular

O sono é frequentemente negligenciado como componente essencial do condicionamento físico e desenvolvimento muscular. No entanto, é durante o sono que ocorrem muitos dos processos de recuperação e crescimento muscular.

## Como o sono afeta a recuperação muscular

Durante o sono profundo, o corpo libera hormônios anabólicos como o GH (hormônio do crescimento) e a testosterona, que são fundamentais para o reparo e crescimento muscular. Além disso, o sono adequado:

1. **Reduz inflamação**: Diminui marcadores inflamatórios que podem retardar a recuperação
2. **Restaura energia**: Reabastece os estoques de glicogênio muscular
3. **Melhora a síntese proteica**: Otimiza a construção de novas proteínas musculares
4. **Equilibra hormônios**: Regula hormônios relacionados ao estresse como o cortisol

## Consequências da privação de sono

- Aumento do catabolismo muscular
- Diminuição da força e desempenho
- Recuperação mais lenta entre treinos
- Maior risco de lesões
- Desequilíbrio hormonal
- Aumento da fome e diminuição da saciedade

## Estratégias para melhorar o sono

### Estabeleça uma rotina
- Vá para a cama e acorde no mesmo horário todos os dias
- Crie um ritual relaxante antes de dormir

### Otimize seu ambiente
- Mantenha o quarto escuro, silencioso e fresco
- Use a cama apenas para dormir e atividades íntimas

### Hábitos diários
- Evite cafeína após o meio-dia
- Limite a exposição à luz azul antes de dormir
- Pratique exercícios regularmente, mas evite treinos intensos próximo à hora de dormir

Para maximizar seus ganhos na academia, priorize 7-9 horas de sono de qualidade por noite. Seu corpo agradece e seus músculos também!
    `,
    image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55',
    category: 'Saúde',
    author: 'Dra. Mariana Costa',
    created_at: '2025-06-01T16:45:00Z'
  },
  {
    id: '5',
    title: 'Como superei a obesidade e transformei minha vida',
    excerpt: 'A inspiradora jornada de João, que perdeu 45kg e encontrou uma nova paixão pelo fitness.',
    content: `
# Como superei a obesidade e transformei minha vida

## Minha jornada

Meu nome é João, e há dois anos eu pesava 125kg. Hoje, 45kg mais leve, quero compartilhar minha jornada de transformação não apenas física, mas mental e emocional.

Desde criança, sempre tive problemas com meu peso. Comida era meu refúgio emocional, e com o tempo, isso se tornou um ciclo vicioso. Aos 32 anos, fui diagnosticado com pré-diabetes e hipertensão. Foi meu momento de despertar.

## O início da mudança

Não foi uma dieta milagrosa ou um programa de exercícios revolucionário que mudou minha vida. Foi a decisão de assumir responsabilidade pela minha saúde e fazer pequenas mudanças consistentes:

1. **Comecei devagar**: Primeiros passos foram literalmente passos - caminhadas diárias de 15 minutos
2. **Educação nutricional**: Aprendi sobre nutrição e comecei a entender o que estava comendo
3. **Apoio profissional**: Busquei ajuda de um nutricionista e um personal trainer
4. **Comunidade**: Encontrei grupos de apoio online e offline

## Desafios e superações

O caminho não foi linear. Houve semanas de estagnação, momentos de recaída e muita frustração. Aprendi que:

- **Paciência é fundamental**: Resultados sustentáveis levam tempo
- **Flexibilidade mental**: Adaptar-se quando as coisas não saem como planejado
- **Celebrar pequenas vitórias**: Cada conquista, por menor que seja, merece reconhecimento

## Além da perda de peso

A transformação foi muito além dos números na balança:

- Meus exames de saúde normalizaram
- Descobri uma paixão por corrida (já completei duas meias-maratonas!)
- Minha autoconfiança e energia melhoraram drasticamente
- Inspirei amigos e familiares a cuidarem melhor da saúde

## Lições aprendidas

Se você está começando sua jornada, lembre-se:

- **Consistência supera perfeição**: É melhor ser 80% consistente do que buscar 100% de perfeição
- **Encontre seu "porquê"**: Tenha clareza sobre suas motivações profundas
- **Seja gentil consigo**: A jornada tem altos e baixos, e isso é normal
- **Peça ajuda**: Ninguém precisa fazer essa jornada sozinho

Hoje, aos 34 anos, não sou apenas uma pessoa mais saudável - sou uma pessoa mais feliz, confiante e grata por cada dia que posso viver plenamente.
    `,
    image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    category: 'Casos de Sucesso',
    author: 'João Pereira',
    created_at: '2025-06-03T11:20:00Z'
  },
  {
    id: '6',
    title: 'Guia completo de suplementação para iniciantes',
    excerpt: 'Entenda quais suplementos realmente funcionam e como utilizá-los corretamente.',
    content: `
# Guia completo de suplementação para iniciantes

A suplementação pode ser um tema confuso para quem está começando no mundo do fitness. Com tantas opções disponíveis e promessas milagrosas, é difícil separar o que realmente funciona do que é apenas marketing.

## Princípios básicos

Antes de tudo, é importante entender que:

1. **Suplementos são complementos**: Como o nome sugere, devem complementar uma dieta balanceada, não substituí-la
2. **Não existem milagres**: Nenhum suplemento substitui treino consistente e alimentação adequada
3. **Individualidade**: O que funciona para uma pessoa pode não funcionar para outra
4. **Qualidade importa**: Opte por marcas confiáveis e produtos testados

## Suplementos com evidência científica

### Proteína Whey
- **Benefícios**: Recuperação muscular, síntese proteica, saciedade
- **Dosagem**: 20-30g por porção, geralmente após treinos
- **Quem deve usar**: Praticamente qualquer pessoa que treina regularmente

### Creatina
- **Benefícios**: Aumento de força, potência e hipertrofia
- **Dosagem**: 3-5g diários, independente do dia de treino
- **Quem deve usar**: Atletas de força e hipertrofia

### Cafeína
- **Benefícios**: Aumento de energia, foco e desempenho
- **Dosagem**: 3-6mg por kg de peso corporal, 30-60 minutos antes do treino
- **Quem deve usar**: Pessoas que buscam melhorar desempenho em treinos

### Vitamina D
- **Benefícios**: Saúde óssea, função imunológica, produção hormonal
- **Dosagem**: 1000-2000 UI diárias (sob orientação médica)
- **Quem deve usar**: Pessoas com baixa exposição solar ou deficiência diagnosticada

## Suplementos situacionais

### BCAA
- **Benefícios**: Potencial redução de catabolismo muscular
- **Relevância**: Geralmente desnecessário se consumo proteico for adequado

### Glutamina
- **Benefícios**: Potencial melhora na recuperação e imunidade
- **Relevância**: Mais importante para atletas de alto rendimento

### Pré-treino
- **Benefícios**: Energia, foco e bombeamento muscular
- **Considerações**: Muitos contêm apenas cafeína e ingredientes não comprovados

## Como começar

Se você está iniciando com suplementação:

1. **Priorize o básico**: Comece com whey protein se necessário para atingir suas metas proteicas
2. **Adicione creatina**: Suplemento com melhor custo-benefício para ganhos de força e massa
3. **Avalie necessidades específicas**: Considere outros suplementos apenas se houver necessidade real

Lembre-se sempre de consultar um profissional de saúde antes de iniciar qualquer suplementação, especialmente se você tiver condições médicas preexistentes.
    `,
    image_url: 'https://images.unsplash.com/photo-1612532275214-e4ca76d0e4d1',
    category: 'Nutrição',
    author: 'Nutricionista Renata Alves',
    created_at: '2025-06-04T13:40:00Z'
  }
];

// API para gerenciamento de posts do blog
export const blogAPI = {
  // Obter todos os posts com paginação e filtro por categoria
  getPosts: async (page = 1, category = 'Todas', postsPerPage = 6) => {
    try {
      // Calcular índices para paginação
      const startIndex = (page - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      
      // Filtrar por categoria se necessário
      let filteredPosts = [...mockPosts];
      if (category !== 'Todas') {
        filteredPosts = mockPosts.filter(post => post.category === category);
      }
      
      // Ordenar por data de criação (mais recentes primeiro)
      filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Aplicar paginação
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      // Calcular total de páginas
      const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
      
      return {
        data: {
          posts: paginatedPosts,
          totalPages,
          currentPage: page,
          totalPosts: filteredPosts.length
        },
        error: null
      };
    } catch (error) {
      console.error('Erro ao obter posts:', error);
      return { data: null, error: 'Erro ao obter posts do blog' };
    }
  },
  
  // Obter um post específico por ID
  getPostById: async (postId) => {
    try {
      const post = mockPosts.find(p => p.id === postId);
      
      if (!post) {
        return { data: null, error: 'Post não encontrado' };
      }
      
      return { data: post, error: null };
    } catch (error) {
      console.error('Erro ao obter post por ID:', error);
      return { data: null, error: 'Erro ao obter post do blog' };
    }
  },
  
  // Obter categorias disponíveis
  getCategories: async () => {
    try {
      // Extrair categorias únicas dos posts
      const categories = ['Todas', ...new Set(mockPosts.map(post => post.category))];
      
      return { data: categories, error: null };
    } catch (error) {
      console.error('Erro ao obter categorias:', error);
      return { data: null, error: 'Erro ao obter categorias do blog' };
    }
  },
  
  // Inscrever-se na newsletter
  subscribeNewsletter: async (email) => {
    try {
      // Simular uma chamada de API bem-sucedida
      console.log(`Inscrevendo email na newsletter: ${email}`);
      
      return { data: { success: true, message: 'Inscrição realizada com sucesso!' }, error: null };
    } catch (error) {
      console.error('Erro ao inscrever na newsletter:', error);
      return { data: null, error: 'Erro ao processar inscrição na newsletter' };
    }
  }
};

export default blogAPI;

