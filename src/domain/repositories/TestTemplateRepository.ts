export interface TestTemplate {
  id: string;
  name?: string;
  description?: string;
  template: string;
  tags?: string[];
}

export interface TestTemplateRepository {
  save(t: TestTemplate): Promise<TestTemplate>;
  get(id: string): Promise<TestTemplate | null>;
  list(): Promise<TestTemplate[]>;
}

export default TestTemplateRepository;
