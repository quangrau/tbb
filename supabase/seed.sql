-- ============================================
-- SEED DATA - Sample Questions for Testing
-- ============================================

-- Primary 2, Term 1 - Addition & Subtraction
INSERT INTO questions (grade, term, question_text, options, correct_option_index, explanation) VALUES
(2, 1, 'What is 15 + 8?', '["22", "23", "24", "25"]', 1, 'Add the ones: 5 + 8 = 13. Write 3, carry 1. Add the tens: 1 + 1 = 2. Answer: 23'),
(2, 1, 'What is 24 - 9?', '["13", "14", "15", "16"]', 2, 'Subtract: 24 - 9. Borrow from tens: 14 - 9 = 5, then add remaining 10. Answer: 15'),
(2, 1, 'What is 36 + 27?', '["53", "63", "73", "83"]', 1, 'Add ones: 6 + 7 = 13. Write 3, carry 1. Add tens: 3 + 2 + 1 = 6. Answer: 63'),
(2, 1, 'What is 50 - 18?', '["32", "33", "34", "42"]', 0, 'Subtract: 50 - 18. Borrow: 40 + 10 - 18 = 32. Answer: 32'),
(2, 1, 'What is 19 + 19?', '["28", "36", "38", "48"]', 2, 'Add: 19 + 19 = 38. Or think: 20 + 20 - 2 = 38'),

-- Primary 2, Term 2 - Multiplication basics
(2, 2, 'What is 3 × 4?', '["7", "10", "12", "14"]', 2, '3 groups of 4: 4 + 4 + 4 = 12'),
(2, 2, 'What is 5 × 2?', '["7", "10", "12", "15"]', 1, '5 groups of 2: 2 + 2 + 2 + 2 + 2 = 10'),
(2, 2, 'What is 4 × 5?', '["15", "18", "20", "25"]', 2, '4 groups of 5: 5 + 5 + 5 + 5 = 20'),
(2, 2, 'What is 6 × 3?', '["15", "18", "21", "24"]', 1, '6 groups of 3: 3 + 3 + 3 + 3 + 3 + 3 = 18'),
(2, 2, 'What is 2 × 9?', '["16", "18", "19", "20"]', 1, '2 groups of 9: 9 + 9 = 18'),

-- Primary 3, Term 1 - Multiplication & Division
(3, 1, 'What is 7 × 6?', '["36", "42", "48", "54"]', 1, '7 × 6 = 42. Think: 7 × 5 = 35, plus 7 = 42'),
(3, 1, 'What is 56 ÷ 8?', '["6", "7", "8", "9"]', 1, '56 ÷ 8 = 7. Check: 8 × 7 = 56'),
(3, 1, 'What is 9 × 8?', '["63", "72", "81", "89"]', 1, '9 × 8 = 72. Think: 10 × 8 = 80, minus 8 = 72'),
(3, 1, 'What is 63 ÷ 9?', '["6", "7", "8", "9"]', 1, '63 ÷ 9 = 7. Check: 9 × 7 = 63'),
(3, 1, 'What is 8 × 7?', '["49", "54", "56", "63"]', 2, '8 × 7 = 56'),

-- Primary 3, Term 2 - Fractions
(3, 2, 'What is 1/4 + 1/4?', '["1/4", "1/2", "2/4", "1/8"]', 1, 'Same denominators: 1/4 + 1/4 = 2/4 = 1/2'),
(3, 2, 'What is 3/5 - 1/5?', '["1/5", "2/5", "3/5", "4/5"]', 1, 'Same denominators: 3/5 - 1/5 = 2/5'),
(3, 2, 'Which fraction is larger: 1/3 or 1/4?', '["1/3", "1/4", "They are equal", "Cannot compare"]', 0, 'With same numerator, smaller denominator = larger fraction. 1/3 > 1/4'),
(3, 2, 'What is 2/6 simplified?', '["1/2", "1/3", "1/6", "2/3"]', 1, 'Divide both by 2: 2/6 = 1/3'),
(3, 2, 'What is 1/2 + 1/4?', '["2/6", "2/4", "3/4", "1/1"]', 2, 'Convert 1/2 to 2/4. Then 2/4 + 1/4 = 3/4'),

-- Primary 4, Term 1 - Multi-digit multiplication
(4, 1, 'What is 23 × 4?', '["82", "86", "92", "96"]', 2, '23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92'),
(4, 1, 'What is 45 × 6?', '["240", "260", "270", "280"]', 2, '45 × 6 = (40 × 6) + (5 × 6) = 240 + 30 = 270'),
(4, 1, 'What is 156 ÷ 12?', '["11", "12", "13", "14"]', 2, '156 ÷ 12 = 13. Check: 12 × 13 = 156'),
(4, 1, 'What is 18 × 15?', '["250", "260", "270", "280"]', 2, '18 × 15 = 18 × 10 + 18 × 5 = 180 + 90 = 270'),
(4, 1, 'What is 324 ÷ 4?', '["71", "79", "81", "84"]', 2, '324 ÷ 4 = 81. Check: 4 × 81 = 324'),

-- Primary 4, Term 2 - Decimals
(4, 2, 'What is 2.5 + 1.3?', '["3.2", "3.5", "3.8", "4.0"]', 2, '2.5 + 1.3 = 3.8'),
(4, 2, 'What is 5.0 - 2.7?', '["2.3", "2.7", "3.3", "3.7"]', 0, '5.0 - 2.7 = 2.3'),
(4, 2, 'What is 0.6 × 3?', '["1.2", "1.5", "1.8", "2.0"]', 2, '0.6 × 3 = 1.8'),
(4, 2, 'Which is greater: 0.45 or 0.5?', '["0.45", "0.5", "They are equal", "Cannot compare"]', 1, '0.5 = 0.50, which is greater than 0.45'),
(4, 2, 'What is 3.6 ÷ 4?', '["0.8", "0.9", "1.0", "1.2"]', 1, '3.6 ÷ 4 = 0.9');

INSERT INTO questions (grade, term, question_text, options, correct_option_index, explanation) VALUES
(2, 1, 'What is 7 + 6?', '["11", "12", "13", "14"]', 2, '7 + 6 = 13'),
(2, 1, 'What is 18 - 7?', '["9", "10", "11", "12"]', 1, '18 - 7 = 11'),
(2, 1, 'What is 20 + 15?', '["33", "34", "35", "36"]', 2, '20 + 15 = 35'),
(2, 1, 'What is 27 - 19?', '["6", "7", "8", "9"]', 1, '27 - 19 = 8'),
(2, 1, 'What is 14 + 9?', '["22", "23", "24", "25"]', 1, '14 + 9 = 23'),
(2, 2, 'What is 3 × 5?', '["10", "12", "15", "18"]', 2, '3 groups of 5 = 15'),
(2, 2, 'What is 2 × 7?', '["12", "14", "16", "18"]', 1, '2 × 7 = 14'),
(2, 2, 'What is 9 × 2?', '["16", "18", "19", "20"]', 3, '9 × 2 = 18, not 20'),
(2, 2, 'What is 4 × 4?', '["12", "14", "16", "18"]', 2, '4 × 4 = 16'),
(2, 2, 'What is 6 × 2?', '["10", "11", "12", "13"]', 2, '6 × 2 = 12'),
(3, 1, 'What is 8 × 5?', '["35", "40", "45", "50"]', 1, '8 × 5 = 40'),
(3, 1, 'What is 64 ÷ 8?', '["6", "7", "8", "9"]', 2, '64 ÷ 8 = 8'),
(3, 1, 'What is 9 × 7?', '["56", "63", "72", "81"]', 1, '9 × 7 = 63'),
(3, 1, 'What is 45 ÷ 5?', '["7", "8", "9", "10"]', 2, '45 ÷ 5 = 9'),
(3, 1, 'What is 6 × 9?', '["48", "54", "57", "63"]', 1, '6 × 9 = 54'),
(3, 2, 'Which fraction is larger: 2/5 or 3/10?', '["2/5", "3/10", "They are equal", "Cannot compare"]', 0, '2/5 = 4/10 > 3/10'),
(3, 2, 'What is 1/3 + 1/3?', '["1/3", "2/3", "1/6", "3/3"]', 1, '1/3 + 1/3 = 2/3'),
(3, 2, 'What is 3/4 - 1/2?', '["1/4", "2/4", "3/4", "1/2"]', 0, '3/4 - 1/2 = 1/4'),
(3, 2, 'Simplify 4/8', '["1/2", "1/4", "2/4", "2/8"]', 0, 'Divide both by 4'),
(3, 2, 'What is 1/5 + 2/5?', '["2/5", "3/5", "4/5", "5/5"]', 1, 'Same denominator: add numerators'),
(4, 1, 'What is 34 × 3?', '["96", "99", "102", "105"]', 1, '34 × 3 = 102'),
(4, 1, 'What is 120 ÷ 8?', '["12", "13", "14", "15"]', 3, '120 ÷ 8 = 15'),
(4, 1, 'What is 27 × 4?', '["98", "104", "108", "112"]', 2, '27 × 4 = 108'),
(4, 1, 'What is 144 ÷ 12?', '["10", "11", "12", "13"]', 2, '144 ÷ 12 = 12'),
(4, 1, 'What is 36 × 5?', '["160", "170", "180", "190"]', 2, '36 × 5 = 180'),
(4, 2, 'What is 1.2 + 1.5?', '["2.5", "2.6", "2.7", "2.8"]', 2, '1.2 + 1.5 = 2.7'),
(4, 2, 'What is 4.0 - 1.75?', '["2.15", "2.25", "2.35", "2.25"]', 1, '4.00 - 1.75 = 2.25'),
(4, 2, 'What is 2.4 × 3?', '["6.8", "7.0", "7.2", "7.4"]', 2, '2.4 × 3 = 7.2'),
(4, 2, 'Which is greater: 0.305 or 0.35?', '["0.305", "0.35", "They are equal", "Cannot compare"]', 1, '0.35 > 0.305'),
(4, 2, 'What is 7.2 ÷ 6?', '["1.0", "1.1", "1.2", "1.3"]', 2, '7.2 ÷ 6 = 1.2');

-- ============================================
-- FREE-FORM QUESTIONS - Sample Questions
-- ============================================

-- Primary 2, Term 1 - Addition word problems (free-form)
INSERT INTO questions (grade, term, question_text, question_type, correct_answer, answer_type, answer_unit, acceptable_answers, explanation) VALUES
(2, 1, 'There are 14 red balloons and 8 blue balloons. How many balloons altogether?', 'free_form', '22', 'integer', 'balloons', NULL, 'Identify the parts: Red (14) and Blue (8). Add: $14 + 8 = 22$. Total is 22 balloons.'),
(2, 1, 'Amy has 25 stickers. Ben has 17 stickers. How many stickers do they have in total?', 'free_form', '42', 'integer', 'stickers', NULL, 'Add the stickers: $25 + 17 = 42$ stickers in total.'),
(2, 1, 'There are 18 boys and 14 girls in a class. How many children are there?', 'free_form', '32', 'integer', 'children', NULL, 'Add boys and girls: $18 + 14 = 32$ children.'),
(2, 1, 'A bag has 27 red apples and 15 green apples. How many apples are there?', 'free_form', '42', 'integer', 'apples', NULL, 'Add both types: $27 + 15 = 42$ apples.'),
(2, 1, 'Sam scored 36 points. Tom scored 28 points. What is their total score?', 'free_form', '64', 'integer', 'points', NULL, 'Add both scores: $36 + 28 = 64$ points.');

-- Primary 2, Term 2 - Multiplication (free-form)
INSERT INTO questions (grade, term, question_text, question_type, correct_answer, answer_type, answer_unit, acceptable_answers, explanation) VALUES
(2, 2, 'There are 4 bags. Each bag has 5 oranges. How many oranges altogether?', 'free_form', '20', 'integer', 'oranges', NULL, 'Multiply: $4 \\times 5 = 20$ oranges.'),
(2, 2, 'A spider has 8 legs. How many legs do 3 spiders have?', 'free_form', '24', 'integer', 'legs', NULL, 'Multiply: $3 \\times 8 = 24$ legs.'),
(2, 2, 'Each box has 6 pencils. There are 4 boxes. How many pencils are there?', 'free_form', '24', 'integer', 'pencils', NULL, 'Multiply: $4 \\times 6 = 24$ pencils.');

-- Primary 3, Term 2 - Fractions (free-form with fraction support)
INSERT INTO questions (grade, term, question_text, question_type, correct_answer, answer_type, answer_unit, acceptable_answers, explanation) VALUES
(3, 2, 'What is half of 1?', 'free_form', '1/2', 'fraction', NULL, '{"0.5", "½"}', 'Half of 1 is $\\frac{1}{2}$ or 0.5.'),
(3, 2, 'A pizza is cut into 4 equal slices. Mary eats 1 slice. What fraction did she eat?', 'free_form', '1/4', 'fraction', NULL, '{"0.25", "¼"}', 'She ate 1 out of 4 slices, which is $\\frac{1}{4}$.'),
(3, 2, 'What fraction is 3 parts out of 5 equal parts?', 'free_form', '3/5', 'fraction', NULL, '{"0.6"}', 'The fraction is $\\frac{3}{5}$, which equals 0.6.'),
(3, 2, 'A ribbon is cut into 8 equal parts. 2 parts are used. What fraction is used?', 'free_form', '2/8', 'fraction', NULL, '{"1/4", "0.25", "¼"}', 'The fraction used is $\\frac{2}{8} = \\frac{1}{4}$.');

-- Primary 4, Term 2 - Decimals (free-form)
INSERT INTO questions (grade, term, question_text, question_type, correct_answer, answer_type, answer_unit, acceptable_answers, explanation) VALUES
(4, 2, 'A book costs $12.50 and a pen costs $3.25. What is the total cost?', 'free_form', '15.75', 'decimal', 'dollars', NULL, 'Add: $12.50 + $3.25 = $15.75$'),
(4, 2, 'John has $20. He spends $7.80. How much does he have left?', 'free_form', '12.20', 'decimal', 'dollars', '{"12.2"}', 'Subtract: $20.00 - $7.80 = $12.20$'),
(4, 2, 'A rope is 5.6 metres long. Another rope is 2.8 metres. What is the total length?', 'free_form', '8.4', 'decimal', 'metres', NULL, 'Add: $5.6 + 2.8 = 8.4$ metres.')
